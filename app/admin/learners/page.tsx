import { createLearner } from "../actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { adminInput, adminLabel } from "@/components/admin/styles";
import type { GradeBand } from "@/lib/database.types";
import { requireAdmin } from "@/lib/supabase/admin";

const gradeLabels: Record<GradeBand, string> = {
  primary: "Primary (P.1 – P.7)",
  middle: "Middle School (S.1 – S.4)",
  upper: "Upper Secondary (S.5 – S.6)",
};

export default async function AdminLearnersPage() {
  const { supabase } = await requireAdmin();

  const [{ data: parents }, { data: learners }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").order("full_name"),
    supabase
      .from("learners")
      .select("id, full_name, grade_band, parent_id, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const parentName = new Map((parents ?? []).map((p) => [p.id, p.full_name]));

  return (
    <div className="space-y-8">
      <AdminForm action={createLearner} submitLabel="Add learner">
        <div>
          <label htmlFor="parent_id" className={adminLabel}>
            Parent account
          </label>
          <select id="parent_id" name="parent_id" required className={adminInput} defaultValue="">
            <option value="">Select parent</option>
            {(parents ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name || p.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="full_name" className={adminLabel}>
            Learner&rsquo;s full name
          </label>
          <input id="full_name" name="full_name" required className={adminInput} />
        </div>
        <div>
          <label htmlFor="grade_band" className={adminLabel}>
            Grade band
          </label>
          <select id="grade_band" name="grade_band" required className={adminInput} defaultValue="">
            <option value="">Select grade band</option>
            {Object.entries(gradeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </AdminForm>

      {!parents?.length && (
        <p className="text-sm text-slate-400">
          No parent accounts exist yet — a parent must register before a learner can be
          attached to them.
        </p>
      )}

      <div className="edge-glow glass rounded-hud p-7">
        <h2 className="mb-5 font-display text-lg font-semibold text-white">
          Learners ({learners?.length ?? 0})
        </h2>
        {!learners?.length ? (
          <p className="text-slate-400">None yet.</p>
        ) : (
          <ul className="space-y-3">
            {learners.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0"
              >
                <span className="font-display font-semibold text-white">{l.full_name}</span>
                <span className="text-sm text-slate-400">
                  {gradeLabels[l.grade_band]} · parent:{" "}
                  {parentName.get(l.parent_id) ?? "unknown"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
