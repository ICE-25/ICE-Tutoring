import { createLearner } from "../actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { CurriculumClassSelect } from "@/components/forms/CurriculumClassSelect";
import { adminInput, adminLabel } from "@/components/admin/styles";
import { describeClass, getReferenceData } from "@/lib/curriculum";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function AdminLearnersPage() {
  const { supabase } = await requireAdmin();
  const { curricula, classLevels } = await getReferenceData();

  const [{ data: parents }, { data: learners }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, phone").order("full_name"),
    supabase
      .from("learners")
      .select("id, full_name, parent_id, created_at, curricula(name), class_levels(label, stage)")
      .order("created_at", { ascending: false }),
  ]);

  const parentName = new Map((parents ?? []).map((p) => [p.id, p.full_name]));

  const rows = (
    (learners ?? []) as unknown as Array<{
      id: string;
      full_name: string;
      parent_id: string;
      curricula: { name: string } | { name: string }[] | null;
      class_levels: { label: string; stage: string } | { label: string; stage: string }[] | null;
    }>
  ).map((l) => {
    const curriculum = Array.isArray(l.curricula) ? l.curricula[0] : l.curricula;
    const level = Array.isArray(l.class_levels) ? l.class_levels[0] : l.class_levels;
    return {
      ...l,
      class_description: describeClass(curriculum ?? undefined, level ?? undefined),
    };
  });

  return (
    <div className="space-y-8">
      <AdminForm action={createLearner} submitLabel="Add learner">
        <div>
          <label htmlFor="parent_id" className={adminLabel}>
            Parent account
          </label>
          <select id="parent_id" name="parent_id" required className={adminInput} defaultValue="">
            <option value="">Select parent</option>
            {/* Two parents can share a name, so every option carries a
                distinguishing detail. The submitted value is always the uuid. */}
            {(parents ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {(p.full_name || "Unnamed") +
                  (p.phone ? ` — ${p.phone}` : ` — ${p.id.slice(0, 8)}`)}
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

        <CurriculumClassSelect curricula={curricula} classLevels={classLevels} />
      </AdminForm>

      {!parents?.length && (
        <p className="text-sm text-slate-400">
          No parent accounts exist yet — a parent must register before a learner can be
          attached to them.
        </p>
      )}

      <div className="edge-glow glass rounded-hud p-7">
        <h2 className="mb-5 font-display text-lg font-semibold text-white">
          Learners ({rows.length})
        </h2>
        {rows.length === 0 ? (
          <p className="text-slate-400">None yet.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0"
              >
                <span className="font-display font-semibold text-white">{l.full_name}</span>
                <span className="text-sm text-slate-400">
                  {l.class_description} · parent: {parentName.get(l.parent_id) ?? "unknown"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
