import { createLesson, setLessonStatus } from "../actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { TimezoneField } from "@/components/admin/TimezoneField";
import { adminInput, adminLabel } from "@/components/admin/styles";
import type { LessonStatus } from "@/lib/database.types";
import { BUSINESS_TIMEZONE_LABEL, formatLessonTime } from "@/lib/datetime";
import { requireAdmin } from "@/lib/supabase/admin";

const statuses: LessonStatus[] = ["scheduled", "completed", "cancelled"];

export default async function AdminLessonsPage() {
  const { supabase } = await requireAdmin();

  const [{ data: rawLearners }, { data: tutors }, { data: lessons }] = await Promise.all([
    supabase
      .from("learners")
      .select("id, full_name, class_levels(label)")
      .order("full_name"),
    supabase
      .from("tutors")
      .select("id, full_name, headline")
      .eq("status", "approved")
      .eq("is_active", true)
      .order("full_name"),
    supabase
      .from("lessons")
      .select("id, learner_id, tutor_id, subject, starts_at, duration_minutes, format, status")
      .order("starts_at", { ascending: false })
      .limit(50),
  ]);

  // Names are not unique. Every option carries a distinguishing detail so an
  // admin can tell two learners called John Mukasa apart; the submitted value
  // is always the uuid.
  const learners = (
    (rawLearners ?? []) as unknown as Array<{
      id: string;
      full_name: string;
      class_levels: { label: string } | { label: string }[] | null;
    }>
  ).map((l) => {
    const level = Array.isArray(l.class_levels) ? l.class_levels[0] : l.class_levels;
    return {
      id: l.id,
      full_name: l.full_name,
      option_label: level ? `${l.full_name} — ${level.label}` : `${l.full_name} — ${l.id.slice(0, 8)}`,
    };
  });

  const learnerName = new Map(learners.map((l) => [l.id, l.full_name]));
  const tutorName = new Map((tutors ?? []).map((t) => [t.id, t.full_name]));

  return (
    <div className="space-y-8">
      <AdminForm action={createLesson} submitLabel="Schedule lesson">
        <div>
          <label htmlFor="learner_id" className={adminLabel}>
            Learner
          </label>
          <select id="learner_id" name="learner_id" required className={adminInput} defaultValue="">
            <option value="">Select learner</option>
            {learners.map((l) => (
              <option key={l.id} value={l.id}>
                {l.option_label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tutor_id" className={adminLabel}>
            Tutor
          </label>
          <select id="tutor_id" name="tutor_id" className={adminInput} defaultValue="">
            <option value="">Unassigned</option>
            {(tutors ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
                {t.headline ? ` — ${t.headline}` : ` — ${t.id.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="subject" className={adminLabel}>
            Subject
          </label>
          <input id="subject" name="subject" required className={adminInput} />
        </div>
        <div>
          <label htmlFor="starts_at" className={adminLabel}>
            Starts at <span className="text-slate-500">(your local time)</span>
          </label>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            required
            className={adminInput}
          />
          <TimezoneField />
        </div>
        <div>
          <label htmlFor="duration_minutes" className={adminLabel}>
            Duration (minutes)
          </label>
          <input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min={15}
            max={480}
            defaultValue={60}
            className={adminInput}
          />
        </div>
        <div>
          <label htmlFor="format" className={adminLabel}>
            Format
          </label>
          <select id="format" name="format" className={adminInput} defaultValue="online">
            <option value="online">Online</option>
            <option value="physical">Physical</option>
          </select>
        </div>
        <div>
          <label htmlFor="location" className={adminLabel}>
            Location <span className="text-slate-500">(physical)</span>
          </label>
          <input id="location" name="location" className={adminInput} />
        </div>
        <div>
          <label htmlFor="meeting_url" className={adminLabel}>
            Meeting link <span className="text-slate-500">(online)</span>
          </label>
          <input id="meeting_url" name="meeting_url" type="url" className={adminInput} />
        </div>
      </AdminForm>

      {learners.length === 0 && (
        <p className="text-sm text-slate-400">
          Add a learner first — lessons must be attached to one.
        </p>
      )}

      <div className="edge-glow glass rounded-hud p-7">
        <h2 className="mb-5 font-display text-lg font-semibold text-white">
          Lessons ({lessons?.length ?? 0})
        </h2>
        {!lessons?.length ? (
          <p className="text-slate-400">None scheduled yet.</p>
        ) : (
          <ul className="space-y-4">
            {lessons.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 last:border-0"
              >
                <div>
                  <strong className="font-display text-white">
                    {learnerName.get(l.learner_id) ?? "Unknown learner"} · {l.subject}
                  </strong>
                  <p className="mt-1 text-sm text-slate-400">
                    {formatLessonTime(l.starts_at, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    {BUSINESS_TIMEZONE_LABEL} · {l.duration_minutes} min · {l.format}
                    {l.tutor_id ? ` · ${tutorName.get(l.tutor_id) ?? "tutor"}` : " · unassigned"}
                  </p>
                </div>
                <form action={setLessonStatus} className="flex gap-2">
                  <input type="hidden" name="id" value={l.id} />
                  <select
                    name="status"
                    defaultValue={l.status}
                    aria-label={`Status for lesson on ${l.starts_at}`}
                    className={`${adminInput} !w-auto !py-2 !text-xs`}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg border border-cyan-brand/40 bg-cyan-brand/10 px-3 text-xs font-semibold text-cyan-glow transition-colors hover:bg-cyan-brand/20"
                  >
                    Save
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
