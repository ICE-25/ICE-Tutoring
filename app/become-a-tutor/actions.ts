"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { TutorApplyState } from "./tutor-state";

function text(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function ids(fd: FormData, key: string) {
  return fd.getAll(key).filter((v): v is string => typeof v === "string" && v.length > 0);
}

const fail = (message: string): TutorApplyState => ({ status: "error", message });

/**
 * Submits a tutor application for the signed-in user.
 *
 * The applicant writes only their own descriptive fields — `status` is not
 * grantable to `authenticated`, so it is set here through the service-role
 * client and can never be forged from the browser.
 */
export async function submitTutorApplication(
  _prev: TutorApplyState,
  fd: FormData,
): Promise<TutorApplyState> {
  const supabase = await createClient();
  if (!supabase) return fail("Applications aren't available right now.");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return fail("Please sign in first, then submit your application.");

  const fullName = text(fd, "full_name");
  const phone = text(fd, "phone");
  const yearsRaw = text(fd, "years_experience");
  const subjectIds = ids(fd, "subject_ids");
  const curriculumIds = ids(fd, "curriculum_ids");
  const classLevelIds = ids(fd, "class_level_ids");

  if (fullName.length < 2) return fail("Please enter your full name.");
  if (phone.replace(/\D/g, "").length < 7) return fail("Please enter a reachable phone number.");
  if (subjectIds.length === 0) return fail("Select at least one subject you teach.");
  if (curriculumIds.length === 0) return fail("Select at least one curriculum you know.");
  if (classLevelIds.length === 0) return fail("Select at least one class or year you can teach.");

  const years = yearsRaw ? Number(yearsRaw) : null;
  if (years !== null && (!Number.isFinite(years) || years < 0 || years > 60)) {
    return fail("Years of experience must be between 0 and 60.");
  }

  const service = createServiceClient();
  if (!service) {
    return fail("Applications aren't available right now. Please message us on WhatsApp.");
  }

  // One tutor record per person; re-submitting updates the existing draft.
  const { data: existing } = await service
    .from("tutors")
    .select("id, status")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing && ["approved", "suspended"].includes(existing.status)) {
    return fail("You already have an approved tutor profile.");
  }

  // profile_id is set once at creation and never reassigned, so it is absent
  // from the update payload by design.
  const fields = {
    full_name: fullName,
    email: user.email ?? null,
    phone,
    headline: text(fd, "headline") || null,
    bio: text(fd, "bio") || null,
    qualifications: text(fd, "qualifications") || null,
    availability_note: text(fd, "availability_note") || null,
    base_location: text(fd, "base_location") || null,
    years_experience: years,
    status: "submitted" as const,
    submitted_at: new Date().toISOString(),
  };

  let resolvedId = existing?.id;

  if (resolvedId) {
    const { error } = await service.from("tutors").update(fields).eq("id", resolvedId);
    if (error) return fail(error.message);
  } else {
    const { data, error } = await service
      .from("tutors")
      .insert({ ...fields, profile_id: user.id })
      .select("id")
      .single();
    if (error || !data) return fail(error?.message ?? "Could not save your application.");
    resolvedId = data.id;
  }

  // Replace the teaching profile wholesale — simpler and idempotent.
  await Promise.all([
    service.from("tutor_subjects").delete().eq("tutor_id", resolvedId!),
    service.from("tutor_curricula").delete().eq("tutor_id", resolvedId!),
    service.from("tutor_class_levels").delete().eq("tutor_id", resolvedId!),
  ]);

  await Promise.all([
    service
      .from("tutor_subjects")
      .insert(subjectIds.map((subject_id) => ({ tutor_id: resolvedId!, subject_id }))),
    service
      .from("tutor_curricula")
      .insert(curriculumIds.map((curriculum_id) => ({ tutor_id: resolvedId!, curriculum_id }))),
    service
      .from("tutor_class_levels")
      .insert(classLevelIds.map((class_level_id) => ({ tutor_id: resolvedId!, class_level_id }))),
  ]);

  await service.from("tutor_applications").insert({ tutor_id: resolvedId! });

  revalidatePath("/become-a-tutor");
  revalidatePath("/admin/tutor-applications");

  return {
    status: "success",
    message:
      "Application received. Our team reviews applications within two business days and will contact you on the number you gave.",
  };
}
