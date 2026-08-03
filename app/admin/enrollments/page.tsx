import { setEnrollmentStatus } from "../actions";
import { adminInput } from "@/components/admin/styles";
import type { EnrollmentStatus, GradeBand } from "@/lib/database.types";
import { requireAdmin } from "@/lib/supabase/admin";

const gradeLabels: Record<GradeBand, string> = {
  primary: "Primary",
  middle: "Middle",
  upper: "Upper",
};

const statuses: EnrollmentStatus[] = [
  "new",
  "contacted",
  "matched",
  "active",
  "cancelled",
];

export default async function AdminEnrollmentsPage() {
  const { supabase } = await requireAdmin();

  const { data: rows } = await supabase
    .from("enrollments")
    .select("id, parent_name, learner_name, grade_band, subject, phone, status, created_at")
    .order("created_at", { ascending: false });

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
              <th className="px-6 py-4">Grade</th>
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
                <td className="px-6 py-4 text-slate-400">
                  {gradeLabels[r.grade_band]}
                </td>
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
