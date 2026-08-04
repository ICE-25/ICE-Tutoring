import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const tabs = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/enrollments", label: "Enrollments" },
  { href: "/admin/tutor-applications", label: "Applications" },
  { href: "/admin/learners", label: "Learners" },
  { href: "/admin/tutors", label: "Tutors" },
  { href: "/admin/lessons", label: "Lessons" },
  { href: "/admin/assessments", label: "Assessments" },
  { href: "/admin/messages", label: "Messages" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  return (
    <div className="relative isolate min-h-screen pb-24 pt-12">
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(21,96,214,0.28),transparent_65%)]"
      />

      <div className="container-ice">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-cyan-brand" aria-hidden />
              <span className="hud-label">Admin console</span>
            </span>
            <h1 className="mt-3 text-display-sm">
              ICE <span className="text-grad">control</span>
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Signed in as <strong className="text-white">{profile.full_name}</strong>
          </p>
        </div>

        <nav aria-label="Admin sections" className="mb-10 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-display text-sm font-medium text-slate-300 transition-all hover:border-cyan-brand/50 hover:text-white"
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
