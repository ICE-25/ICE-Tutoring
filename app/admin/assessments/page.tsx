import { createAssessment } from "../actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { adminInput, adminLabel } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function AdminAssessmentsPage() {
  const { supabase } = await requireAdmin();

  const [{ data: rawLearners }, { data: assessments }] = await Promise.all([
    supabase
      .from("learners")
      .select("id, full_name, class_levels(label)")
      .order("full_name"),
    supabase
      .from("assessments")
      .select("id, learner_id, subject, title, term, score, max_score, grade, assessed_on")
      .order("assessed_on", { ascending: false })
      .limit(50),
  ]);

  // Learner names are not unique — every option carries a distinguishing
  // detail, while the submitted value stays the uuid.
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
      option_label: level
        ? `${l.full_name} — ${level.label}`
        : `${l.full_name} — ${l.id.slice(0, 8)}`,
    };
  });

  const learnerName = new Map(learners.map((l) => [l.id, l.full_name]));

  return (
    <div className="space-y-8">
      <AdminForm action={createAssessment} submitLabel="Record assessment">
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
          <label htmlFor="subject" className={adminLabel}>
            Subject
          </label>
          <input id="subject" name="subject" required className={adminInput} />
        </div>
        <div>
          <label htmlFor="title" className={adminLabel}>
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            placeholder="e.g. Mid-term test"
            className={adminInput}
          />
        </div>
        <div>
          <label htmlFor="term" className={adminLabel}>
            Term
          </label>
          <input id="term" name="term" placeholder="e.g. Term 2, 2026" className={adminInput} />
        </div>
        <div>
          <label htmlFor="score" className={adminLabel}>
            Score
          </label>
          <input id="score" name="score" type="number" step="0.01" min={0} className={adminInput} />
        </div>
        <div>
          <label htmlFor="max_score" className={adminLabel}>
            Out of
          </label>
          <input
            id="max_score"
            name="max_score"
            type="number"
            step="0.01"
            min={1}
            defaultValue={100}
            className={adminInput}
          />
        </div>
        <div>
          <label htmlFor="grade" className={adminLabel}>
            Grade
          </label>
          <input id="grade" name="grade" placeholder="e.g. A" className={adminInput} />
        </div>
        <div>
          <label htmlFor="assessed_on" className={adminLabel}>
            Date
          </label>
          <input id="assessed_on" name="assessed_on" type="date" className={adminInput} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="comment" className={adminLabel}>
            Comment for the parent
          </label>
          <textarea id="comment" name="comment" rows={3} className={adminInput} />
        </div>
      </AdminForm>

      {learners.length === 0 && (
        <p className="text-sm text-slate-400">
          Add a learner first — assessments must be attached to one.
        </p>
      )}

      <div className="edge-glow glass rounded-hud p-7">
        <h2 className="mb-5 font-display text-lg font-semibold text-white">
          Assessments ({assessments?.length ?? 0})
        </h2>
        {!assessments?.length ? (
          <p className="text-slate-400">None recorded yet.</p>
        ) : (
          <ul className="space-y-4">
            {assessments.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 last:border-0"
              >
                <div>
                  <strong className="font-display text-white">
                    {learnerName.get(a.learner_id) ?? "Unknown learner"} · {a.subject}
                  </strong>
                  <p className="mt-1 text-sm text-slate-400">
                    {a.title}
                    {a.term ? ` · ${a.term}` : ""} ·{" "}
                    {new Date(a.assessed_on).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="font-display text-lg font-bold text-cyan-glow">
                  {a.score !== null ? `${a.score}${a.max_score ? ` / ${a.max_score}` : ""}` : "—"}
                  {a.grade ? ` (${a.grade})` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
