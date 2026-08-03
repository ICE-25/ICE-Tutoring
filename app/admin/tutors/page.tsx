import { createTutor } from "../actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { adminInput, adminLabel } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function AdminTutorsPage() {
  const { supabase } = await requireAdmin();

  const { data: tutors } = await supabase
    .from("tutors")
    .select("id, full_name, headline, subjects, is_active")
    .order("full_name");

  return (
    <div className="space-y-8">
      <AdminForm action={createTutor} submitLabel="Add tutor">
        <div>
          <label htmlFor="full_name" className={adminLabel}>
            Full name
          </label>
          <input id="full_name" name="full_name" required className={adminInput} />
        </div>
        <div>
          <label htmlFor="headline" className={adminLabel}>
            Headline
          </label>
          <input
            id="headline"
            name="headline"
            placeholder="e.g. A-Level Physics specialist"
            className={adminInput}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="subjects" className={adminLabel}>
            Subjects <span className="text-slate-500">(comma separated)</span>
          </label>
          <input
            id="subjects"
            name="subjects"
            placeholder="Mathematics, Physics, Coding"
            className={adminInput}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="bio" className={adminLabel}>
            Bio
          </label>
          <textarea id="bio" name="bio" rows={3} className={adminInput} />
        </div>
      </AdminForm>

      <div className="edge-glow glass rounded-hud p-7">
        <h2 className="mb-5 font-display text-lg font-semibold text-white">
          Tutors ({tutors?.length ?? 0})
        </h2>
        {!tutors?.length ? (
          <p className="text-slate-400">None yet.</p>
        ) : (
          <ul className="space-y-4">
            {tutors.map((t) => (
              <li key={t.id} className="border-b border-white/5 pb-4 last:border-0">
                <div className="flex flex-wrap items-center gap-3">
                  <strong className="font-display text-white">{t.full_name}</strong>
                  {!t.is_active && (
                    <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wider text-slate-400">
                      inactive
                    </span>
                  )}
                </div>
                {t.headline && <p className="mt-1 text-sm text-slate-400">{t.headline}</p>}
                {t.subjects.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-2">
                    {t.subjects.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-cyan-brand/30 bg-cyan-brand/10 px-3 py-1 text-xs text-cyan-glow"
                      >
                        {s}
                      </span>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
