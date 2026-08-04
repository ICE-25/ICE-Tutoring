import { reviewTutorApplication } from "../actions";
import { adminInput } from "@/components/admin/styles";
import type { TutorStatus } from "@/lib/database.types";
import { requireAdmin } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

const statusStyles: Record<TutorStatus, string> = {
  draft: "border-white/15 bg-white/5 text-slate-400",
  submitted: "border-cyan-brand/40 bg-cyan-brand/10 text-cyan-glow",
  approved: "border-whatsapp-bright/40 bg-whatsapp/10 text-whatsapp-bright",
  rejected: "border-rose-400/40 bg-rose-400/10 text-rose-300",
  suspended: "border-gold/40 bg-gold/10 text-gold",
};

export default async function AdminTutorApplicationsPage() {
  const { supabase } = await requireAdmin();

  const { data: tutors } = await supabase
    .from("tutors")
    .select(
      "id, full_name, headline, email, phone, status, years_experience, qualifications, availability_note, base_location, bio, submitted_at",
    )
    .neq("status", "draft")
    .order("submitted_at", { ascending: false, nullsFirst: false });

  if (!tutors?.length) {
    return (
      <div className="glass rounded-hud p-10 text-center text-slate-400">
        No tutor applications yet. Submissions from{" "}
        <span className="text-cyan-brand">/become-a-tutor</span> appear here.
      </div>
    );
  }

  // Teaching profiles for all listed tutors, resolved in one round trip each.
  const ids = tutors.map((t) => t.id);
  const [{ data: subs }, { data: curs }, { data: levels }] = await Promise.all([
    supabase.from("tutor_subjects").select("tutor_id, subjects(name)").in("tutor_id", ids),
    supabase.from("tutor_curricula").select("tutor_id, curricula(code)").in("tutor_id", ids),
    supabase
      .from("tutor_class_levels")
      .select("tutor_id, class_levels(label)")
      .in("tutor_id", ids),
  ]);

  const collect = <T,>(
    rows: unknown[] | null,
    pick: (row: Record<string, unknown>) => T | undefined,
  ) => {
    const map = new Map<string, T[]>();
    for (const raw of (rows ?? []) as Record<string, unknown>[]) {
      const key = raw.tutor_id as string;
      const value = pick(raw);
      if (value === undefined) continue;
      map.set(key, [...(map.get(key) ?? []), value]);
    }
    return map;
  };

  const one = (v: unknown) => (Array.isArray(v) ? v[0] : v) as Record<string, string> | null;

  const subjectMap = collect(subs, (r) => one(r.subjects)?.name);
  const curriculumMap = collect(curs, (r) => one(r.curricula)?.code);
  const levelMap = collect(levels, (r) => one(r.class_levels)?.label);

  return (
    <div className="space-y-6">
      {tutors.map((t) => (
        <div key={t.id} className="edge-glow glass rounded-hud p-7">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-white">{t.full_name}</h2>
              {t.headline && <p className="mt-1 text-sm text-slate-400">{t.headline}</p>}
              <p className="mt-2 text-sm text-slate-400">
                {t.email ?? "no email"} · {t.phone ?? "no phone"}
                {t.base_location ? ` · ${t.base_location}` : ""}
                {t.years_experience !== null ? ` · ${t.years_experience} yrs` : ""}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full border px-3.5 py-1.5 font-hud text-[0.65rem] uppercase tracking-[0.16em]",
                statusStyles[t.status],
              )}
            >
              {t.status}
            </span>
          </div>

          <dl className="mb-5 grid gap-4 sm:grid-cols-3">
            {[
              ["Subjects", subjectMap.get(t.id)],
              ["Curricula", curriculumMap.get(t.id)],
              ["Classes", levelMap.get(t.id)],
            ].map(([label, values]) => (
              <div key={label as string}>
                <dt className="hud-label mb-2">{label as string}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {((values as string[] | undefined) ?? ["—"]).map((v, i) => (
                    <span
                      key={`${v}-${i}`}
                      className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300"
                    >
                      {v}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>

          {(t.qualifications || t.availability_note || t.bio) && (
            <div className="mb-6 space-y-3 border-l-2 border-cyan-brand/30 pl-4 text-sm text-slate-300">
              {t.qualifications && (
                <p>
                  <strong className="text-white">Qualifications:</strong> {t.qualifications}
                </p>
              )}
              {t.availability_note && (
                <p>
                  <strong className="text-white">Availability:</strong> {t.availability_note}
                </p>
              )}
              {t.bio && <p>{t.bio}</p>}
            </div>
          )}

          <form
            action={reviewTutorApplication}
            className="flex flex-wrap items-end gap-3 border-t border-white/10 pt-5"
          >
            <input type="hidden" name="tutor_id" value={t.id} />
            <div className="min-w-[14rem] flex-1">
              <label htmlFor={`notes-${t.id}`} className="sr-only">
                Review notes for {t.full_name}
              </label>
              <input
                id={`notes-${t.id}`}
                name="review_notes"
                placeholder="Review notes (optional)"
                className={adminInput}
              />
            </div>
            <button
              type="submit"
              name="decision"
              value="approved"
              className="btn btn-primary !px-5 !py-3 text-sm"
            >
              Approve
            </button>
            <button
              type="submit"
              name="decision"
              value="rejected"
              className="rounded-full border border-rose-400/40 bg-rose-400/10 px-5 py-3 font-display text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-400/20"
            >
              Reject
            </button>
            {t.status === "approved" && (
              <button
                type="submit"
                name="decision"
                value="suspended"
                className="rounded-full border border-gold/40 bg-gold/10 px-5 py-3 font-display text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
              >
                Suspend
              </button>
            )}
          </form>
        </div>
      ))}
    </div>
  );
}
