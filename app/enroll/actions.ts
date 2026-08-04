"use server";

import type { GradeBand } from "@/lib/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getClientIpHash, rateLimit } from "@/lib/rate-limit";
import { isTurnstileLive, verifyTurnstile } from "@/lib/turnstile";
import { sendEnrollmentConfirmation } from "@/lib/email";
import { describeClass } from "@/lib/curriculum";
import { siteUrl } from "@/lib/site-url";
import type { EnrollFieldErrors, EnrollState } from "./enroll-state";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitEnrollment(
  _prev: EnrollState,
  formData: FormData,
): Promise<EnrollState> {
  const parentName = text(formData, "parent-name");
  const learnerName = text(formData, "learner-name");
  const curriculumId = text(formData, "curriculum_id");
  const classLevelId = text(formData, "class_level_id");
  const subject = text(formData, "subject");
  const phone = text(formData, "phone");
  const email = text(formData, "email").toLowerCase();

  // ---- validation ----
  const fieldErrors: EnrollFieldErrors = {};

  if (parentName.length < 2) fieldErrors.parentName = "Please enter the parent or guardian's name.";
  if (learnerName.length < 2) fieldErrors.learnerName = "Please enter the learner's name.";
  if (!UUID_RE.test(curriculumId)) fieldErrors.curriculum = "Please choose a curriculum.";
  if (!UUID_RE.test(classLevelId)) fieldErrors.classLevel = "Please choose a class or year.";

  // Permissive on format — Ugandan numbers are written many ways.
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) fieldErrors.phone = "Please enter a reachable phone number.";

  // Optional — but if given it must be usable, or the confirmation bounces.
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "That email address doesn't look right.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  // ---- abuse controls ----
  // NOTE: these guard THIS server action. Because the Supabase anon key is
  // public by design, a determined attacker can still POST straight to
  // PostgREST and bypass both. Closing that fully means revoking anon INSERT
  // on enrollments and having this action write with a service-role key
  // instead — see the note in the project README.
  // Loud warning if a production deploy is still on Cloudflare's test keys,
  // which accept every token — i.e. no bot protection at all.
  if (process.env.NODE_ENV === "production" && !isTurnstileLive) {
    console.error(
      "SECURITY: Turnstile is running on test keys in production — the enroll " +
        "endpoint is effectively unprotected. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY " +
        "and TURNSTILE_SECRET_KEY.",
    );
  }

  const { ip, hash } = await getClientIpHash();

  const limit = rateLimit(`enroll:${hash}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterSeconds / 60);
    return {
      status: "error",
      message: `Too many submissions from this connection. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}, or message us on WhatsApp.`,
      fieldErrors: {},
    };
  }

  const turnstile = await verifyTurnstile(
    text(formData, "cf-turnstile-response") || null,
    ip !== "unknown" ? ip : undefined,
  );

  if (!turnstile.ok) {
    console.warn("Turnstile rejected an enrollment:", turnstile.reason);
    return {
      status: "error",
      message:
        "We couldn't verify that you're human. Please refresh the page and try again, or message us on WhatsApp.",
      fieldErrors: {},
    };
  }

  // ---- no database configured: keep the original demo behaviour ----
  if (!isSupabaseConfigured) {
    return {
      status: "demo",
      message: "This is a demo form — connect it to your backend to go live.",
      fieldErrors: {},
    };
  }

  // ---- persist ----
  const supabase = await createClient();
  if (!supabase) {
    return {
      status: "demo",
      message: "This is a demo form — connect it to your backend to go live.",
      fieldErrors: {},
    };
  }

  // Attribute the enrollment to the parent if they happen to be signed in.
  // Identity always comes from the cookie-scoped client, never from the form.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Prefer the service-role client for the write. Once anon INSERT on
  // enrollments is revoked, this is the only path in, so Turnstile and the
  // rate limit can no longer be skipped by calling PostgREST directly.
  const writer = createServiceClient() ?? supabase;

  // Verify the class actually belongs to the chosen curriculum. The ids come
  // from the browser, so a mismatched pair must not reach the database even
  // though both are individually valid uuids.
  const { data: level } = await writer
    .from("class_levels")
    .select("id")
    .eq("id", classLevelId)
    .eq("curriculum_id", curriculumId)
    .maybeSingle();

  if (!level) {
    return {
      status: "error",
      message: "That class doesn't belong to the selected curriculum. Please reselect.",
      fieldErrors: { classLevel: "Choose a class from this curriculum." },
    };
  }

  const { error } = await writer.from("enrollments").insert({
    parent_id: user?.id ?? null,
    parent_name: parentName,
    learner_name: learnerName,
    curriculum_id: curriculumId,
    class_level_id: classLevelId,
    subject: subject || null,
    phone,
    email: email || user?.email || null,
  });

  if (error) {
    console.error("Enrollment insert failed:", error.message);
    return {
      status: "error",
      message:
        "Sorry — we couldn't save that. Please try again, or message us on WhatsApp and we'll enroll your learner directly.",
      fieldErrors: {},
    };
  }

  // Confirmation is best-effort: the enrolment is already saved, so a mail
  // failure must not surface as an error to the parent.
  const notifyTo = email || user?.email;
  if (notifyTo) {
    const { data: labels } = await writer
      .from("class_levels")
      .select("label, stage, curricula(name)")
      .eq("id", classLevelId)
      .maybeSingle();

    const curriculum = Array.isArray(labels?.curricula)
      ? labels?.curricula[0]
      : labels?.curricula;

    await sendEnrollmentConfirmation({
      to: notifyTo,
      parentName,
      learnerName,
      classDescription: describeClass(
        (curriculum as { name: string } | undefined) ?? undefined,
        labels ?? undefined,
      ),
      subject: subject || null,
      siteUrl: siteUrl(),
    });
  }

  return {
    status: "success",
    message:
      "Enrollment received. We'll confirm on WhatsApp within one business day.",
    fieldErrors: {},
  };
}
