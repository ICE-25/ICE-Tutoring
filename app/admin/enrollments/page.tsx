import { setEnrollmentStatus } from "../actions";
import { adminInput } from "@/components/admin/styles";
import { describeClass } from "@/lib/curriculum";
import type { EnrollmentStatus } from "@/lib/database.types";
import { requireAdmin } from "@/lib/supabase/admin";

const statuses: EnrollmentStatus[] = [
  "new",
  "contacted",
  "matched",
  "active",
  "cancelled",
];

export default async function AdminEnrollmentsPage() {
  const { supabase } = await requireAdmin();

  const { data: raw } = await supabase
    .from("enrollments")
    .select(
      "id, parent_name, learner_name, subject, phone, status, created_at, curricula(name), class_levels(label, stage)",
    )
    .order("created_at", { ascending: false });

  const rows = (
    (raw ?? []) as unknown as Array<{
      id: string;
      parent_name: string;
      learner_name: string;
      subject: string | null;
      phone: string;
      status: EnrollmentStatus;
      created_at: string;
      curricula: { name: string } | { name: string }[] | null;
      class_levels: { label: string; stage: string } | { label: string; stage: string }[] | null;
    }>
  ).map((r) => {
    const curriculum = Array.isArray(r.curricula) ? r.curricula[0] : r.curricula;
    const level = Array.isArray(r.class_levels) ? r.class_levels[0] : r.class_levels;
    return {
      ...r,
      class_description: describeClass(curriculum ?? undefined, level ?? undefined),
    };
  });

  if (!rows?.length) {
    return (
      <div className="glass rounded-hud p-10 text-center text-slate-400">
        No enrollments yet. Submissions from the enroll form will appear here.
      </div>
    );
  }

  return (
    <div className="edge-glow glass overflow-hidden rounded-hud">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 font-hud text-[0.65rem] uppercase tracking-[0.16em] text-slate-400">
              <th className="px-6 py-4">Learner</th>
              <th className="px-6 py-4">Parent</th>
              <th className="px-6 py-4">Curriculum &amp; class</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Received</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-white/5 last:border-0">
                <td className="px-6 py-4 font-display font-semibold text-white">
                  {r.learner_name}
                </td>
                <td className="px-6 py-4 text-slate-300">{r.parent_name}</td>
                <td className="px-6 py-4 text-slate-400">{r.class_description}</td>
                <td className="px-6 py-4 text-slate-400">{r.subject ?? "—"}</td>
                <td className="px-6 py-4">
                  <a
                    href={`https://wa.me/${r.phone.replace(/\D/g, "").replace(/^0/, "256")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-whatsapp-bright hover:underline"
                  >
                    {r.phone}
                  </a>
                </td>
                <td className="px-6 py-4 font-hud text-[0.7rem] uppercase tracking-[0.12em] text-slate-500">
                  {new Date(r.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </td>
                <td className="px-6 py-4">
                  <form action={setEnrollmentStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <select
                      name="status"
                      defaultValue={r.status}
                      className={`${adminInput} !w-auto !py-2 !text-xs`}
                      aria-label={`Status for ${r.learner_name}`}
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
