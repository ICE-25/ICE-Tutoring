import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/admin";

type Tile = { label: string; count: number | null; href: string; hint: string };

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();

  // head:true returns only the count, never the rows.
  const [
    enrollments,
    newEnrollments,
    learners,
    tutors,
    lessons,
    assessments,
    threads,
    pendingTutors,
  ] = await Promise.all([
      supabase.from("enrollments").select("*", { count: "exact", head: true }),
      supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("status", "new"),
      supabase.from("learners").select("*", { count: "exact", head: true }),
      supabase.from("tutors").select("*", { count: "exact", head: true }),
      supabase.from("lessons").select("*", { count: "exact", head: true }),
      supabase.from("assessments").select("*", { count: "exact", head: true }),
      supabase.from("conversations").select("*", { count: "exact", head: true }),
      supabase
        .from("tutors")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted"),
    ]);

  const tiles: Tile[] = [
    {
      label: "Awaiting triage",
      count: newEnrollments.count,
      href: "/admin/enrollments",
      hint: "Enrollments nobody has contacted yet",
    },
    {
      label: "Tutor applications",
      count: pendingTutors.count,
      href: "/admin/tutor-applications",
      hint: "Awaiting your review",
    },
    {
      label: "Total enrollments",
      count: enrollments.count,
      href: "/admin/enrollments",
      hint: "All submissions ever received",
    },
    {
      label: "Learners",
      count: learners.count,
      href: "/admin/learners",
      hint: "Children registered to a parent account",
    },
    {
      label: "Tutors",
      count: tutors.count,
      href: "/admin/tutors",
      hint: "Educator records",
    },
    {
      label: "Lessons",
      count: lessons.count,
      href: "/admin/lessons",
      hint: "Scheduled and completed sessions",
    },
    {
      label: "Assessments",
      count: assessments.count,
      href: "/admin/assessments",
      hint: "Marks recorded against learners",
    },
    {
      label: "Message threads",
      count: threads.count,
      href: "/admin/messages",
      hint: "Parent conversations",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((t) => (
        <Link
          key={t.label}
          href={t.href}
          className="edge-glow glass group rounded-hud p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-glow"
        >
          <span className="hud-label">{t.label}</span>
          <strong className="mt-3 block font-display text-4xl font-bold tabular-nums text-white">
            {t.count ?? "—"}
          </strong>
          <p className="mt-2 text-sm text-slate-400">{t.hint}</p>
        </Link>
      ))}
    </div>
  );
}
