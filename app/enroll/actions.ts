"use server";

import type { GradeBand } from "@/lib/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getClientIpHash, rateLimit } from "@/lib/rate-limit";
import { isTurnstileLive, verifyTurnstile } from "@/lib/turnstile";
import type { EnrollFieldErrors, EnrollState } from "./enroll-state";

/** Maps the form's display labels onto the grade_band enum. */
function toGradeBand(label: string | null): GradeBand | null {
  if (!label) return null;
  if (label.startsWith("Primary")) return "primary";
  if (label.startsWith("Middle")) return "middle";
  if (label.startsWith("Upper")) return "upper";
  return null;
}

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
  const gradeLabel = text(formData, "grade");
  const subject = text(formData, "subject");
  const phone = text(formData, "phone");

  // ---- validation ----
  const fieldErrors: EnrollFieldErrors = {};

  if (parentName.length < 2) fieldErrors.parentName = "Please enter the parent or guardian's name.";
  if (learnerName.length < 2) fieldErrors.learnerName = "Please enter the learner's name.";

  const gradeBand = toGradeBand(gradeLabel);
  if (!gradeBand) fieldErrors.grade = "Please choose a grade level.";

  // Permissive on format — Ugandan numbers are written many ways.
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) fieldErrors.phone = "Please enter a reachable phone number.";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("enrollments").insert({
    parent_id: user?.id ?? null,
    parent_name: parentName,
    learner_name: learnerName,
    grade_band: gradeBand!,
    subject: subject || null,
    phone,
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

  return {
    status: "success",
    message:
      "Enrollment received. We'll confirm on WhatsApp within one business day.",
    fieldErrors: {},
  };
}
