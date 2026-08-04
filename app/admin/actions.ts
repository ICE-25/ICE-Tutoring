"use server";

import { revalidatePath } from "next/cache";
import type {
  EnrollmentStatus,
  LessonFormat,
  LessonStatus,
} from "@/lib/database.types";
import { BUSINESS_TIMEZONE, zonedLocalToUtc } from "@/lib/datetime";
import { requireAdmin } from "@/lib/supabase/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { sendTutorApproved, sendTutorRejected } from "@/lib/email";
import { siteUrl } from "@/lib/site-url";
import type { AdminState } from "./admin-state";

function text(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function num(fd: FormData, key: string): number | null {
  const raw = text(fd, key);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

const ok = (message: string): AdminState => ({ status: "success", message });
const fail = (message: string): AdminState => ({ status: "error", message });

// ---------------------------------------------------------------------------
// Enrollments — triage
// ---------------------------------------------------------------------------
export async function setEnrollmentStatus(fd: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = text(fd, "id");
  const status = text(fd, "status") as EnrollmentStatus;

  await supabase.from("enrollments").update({ status }).eq("id", id);
  revalidatePath("/admin/enrollments");
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Learners
// ---------------------------------------------------------------------------
export async function createLearner(
  _prev: AdminState,
  fd: FormData,
): Promise<AdminState> {
  const { supabase } = await requireAdmin();

  const parentId = text(fd, "parent_id");
  const fullName = text(fd, "full_name");
  const curriculumId = text(fd, "curriculum_id");
  const classLevelId = text(fd, "class_level_id");

  if (!parentId) return fail("Choose the parent this learner belongs to.");
  if (fullName.length < 2) return fail("Enter the learner's full name.");
  if (!curriculumId) return fail("Choose a curriculum.");
  if (!classLevelId) return fail("Choose a class or year.");

  // The pair comes from the browser, so confirm the class really belongs to
  // the chosen curriculum before storing it.
  const { data: level } = await supabase
    .from("class_levels")
    .select("id")
    .eq("id", classLevelId)
    .eq("curriculum_id", curriculumId)
    .maybeSingle();

  if (!level) return fail("That class doesn't belong to the selected curriculum.");

  const { error } = await supabase.from("learners").insert({
    parent_id: parentId,
    full_name: fullName,
    curriculum_id: curriculumId,
    class_level_id: classLevelId,
  });

  if (error) return fail(error.message);

  revalidatePath("/admin/learners");
  revalidatePath("/admin");
  return ok(`${fullName} added.`);
}

// ---------------------------------------------------------------------------
// Tutors
// ---------------------------------------------------------------------------
export async function createTutor(
  _prev: AdminState,
  fd: FormData,
): Promise<AdminState> {
  const { supabase } = await requireAdmin();

  const fullName = text(fd, "full_name");
  if (fullName.length < 2) return fail("Enter the tutor's full name.");

  const subjects = text(fd, "subjects")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase.from("tutors").insert({
    full_name: fullName,
    headline: text(fd, "headline") || null,
    bio: text(fd, "bio") || null,
    subjects,
  });

  if (error) return fail(error.message);

  revalidatePath("/admin/tutors");
  revalidatePath("/admin");
  return ok(`${fullName} added.`);
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------
export async function createLesson(
  _prev: AdminState,
  fd: FormData,
): Promise<AdminState> {
  const { supabase } = await requireAdmin();

  const learnerId = text(fd, "learner_id");
  const subject = text(fd, "subject");
  const startsAtLocal = text(fd, "starts_at");
  const format = text(fd, "format") as LessonFormat;

  if (!learnerId) return fail("Choose a learner.");
  if (subject.length < 2) return fail("Enter a subject.");
  if (!startsAtLocal) return fail("Choose a date and time.");

  // datetime-local carries no zone, so convert using the one the browser
  // reported. Falls back to Africa/Kampala if the hidden field is missing.
  const startsAt = zonedLocalToUtc(
    startsAtLocal,
    text(fd, "client_timezone") || BUSINESS_TIMEZONE,
  );
  if (!startsAt) return fail("That date and time is not valid.");

  const duration = num(fd, "duration_minutes") ?? 60;
  if (duration < 15 || duration > 480)
    return fail("Duration must be between 15 and 480 minutes.");

  const { error } = await supabase.from("lessons").insert({
    learner_id: learnerId,
    tutor_id: text(fd, "tutor_id") || null,
    subject,
    starts_at: startsAt.toISOString(),
    duration_minutes: duration,
    format: format === "physical" ? "physical" : "online",
    location: text(fd, "location") || null,
    meeting_url: text(fd, "meeting_url") || null,
    notes: text(fd, "notes") || null,
  });

  if (error) return fail(error.message);

  revalidatePath("/admin/lessons");
  revalidatePath("/account");
  revalidatePath("/admin");
  return ok("Lesson scheduled.");
}

export async function setLessonStatus(fd: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = text(fd, "id");
  const status = text(fd, "status") as LessonStatus;

  await supabase.from("lessons").update({ status }).eq("id", id);
  revalidatePath("/admin/lessons");
  revalidatePath("/account");
}

// ---------------------------------------------------------------------------
// Tutor applications — approve / reject
// ---------------------------------------------------------------------------
/**
 * Records a decision on a tutor application.
 *
 * Runs through the service-role client because `tutors.status` and
 * `profiles.role` are deliberately not writable by `authenticated` — admins
 * included. requireAdmin() is what authorises this; the service key is only
 * the mechanism.
 */
export async function reviewTutorApplication(fd: FormData): Promise<void> {
  const { user } = await requireAdmin();

  const tutorId = text(fd, "tutor_id");
  const decision = text(fd, "decision");
  const notes = text(fd, "review_notes");

  if (!tutorId || !["approved", "rejected", "suspended"].includes(decision)) return;

  const service = createServiceClient();
  if (!service) {
    console.error("reviewTutorApplication: SUPABASE_SERVICE_ROLE_KEY is not set");
    return;
  }

  const { data: tutor } = await service
    .from("tutors")
    .select("profile_id")
    .eq("id", tutorId)
    .maybeSingle();

  await service
    .from("tutors")
    .update({
      status: decision as "approved" | "rejected" | "suspended",
      is_active: decision === "approved",
    })
    .eq("id", tutorId);

  // Promote or demote the underlying account. A rejected applicant returns to
  // being an ordinary parent rather than losing their login.
  if (tutor?.profile_id) {
    await service
      .from("profiles")
      .update({ role: decision === "approved" ? "tutor" : "parent" })
      .eq("id", tutor.profile_id);
  }

  // Tell the applicant. Sending must never block the decision itself, so
  // failures are logged inside the email layer rather than thrown.
  const { data: contact } = await service
    .from("tutors")
    .select("full_name, email")
    .eq("id", tutorId)
    .maybeSingle();

  if (contact?.email) {
    if (decision === "approved") {
      await sendTutorApproved({
        to: contact.email,
        tutorName: contact.full_name,
        siteUrl: siteUrl(),
      });
    } else if (decision === "rejected") {
      await sendTutorRejected({
        to: contact.email,
        tutorName: contact.full_name,
        notes: notes || null,
      });
    }
  }

  // Close the newest open application on the audit trail.
  const { data: application } = await service
    .from("tutor_applications")
    .select("id")
    .eq("tutor_id", tutorId)
    .is("decision", null)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (application) {
    await service
      .from("tutor_applications")
      .update({
        decision: decision as "approved" | "rejected" | "suspended",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
      })
      .eq("id", application.id);
  }

  revalidatePath("/admin/tutor-applications");
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Messaging — admin reply
// ---------------------------------------------------------------------------
export async function replyToConversation(fd: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();

  const conversationId = text(fd, "conversation_id");
  const body = text(fd, "body");
  if (!conversationId || !body) return;

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body,
  });

  revalidatePath("/admin/messages");
  revalidatePath("/account");
}

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------
export async function createAssessment(
  _prev: AdminState,
  fd: FormData,
): Promise<AdminState> {
  const { supabase } = await requireAdmin();

  const learnerId = text(fd, "learner_id");
  const subject = text(fd, "subject");
  const title = text(fd, "title");

  if (!learnerId) return fail("Choose a learner.");
  if (subject.length < 2) return fail("Enter a subject.");
  if (title.length < 2) return fail("Enter a title, e.g. 'Mid-term test'.");

  const score = num(fd, "score");
  const maxScore = num(fd, "max_score");
  if (score !== null && maxScore !== null && score > maxScore)
    return fail("Score cannot be higher than the maximum score.");

  const { error } = await supabase.from("assessments").insert({
    learner_id: learnerId,
    subject,
    title,
    term: text(fd, "term") || null,
    score,
    max_score: maxScore,
    grade: text(fd, "grade") || null,
    assessed_on: text(fd, "assessed_on") || undefined,
    comment: text(fd, "comment") || null,
  });

  if (error) return fail(error.message);

  revalidatePath("/admin/assessments");
  revalidatePath("/account");
  revalidatePath("/admin");
  return ok("Assessment recorded.");
}
