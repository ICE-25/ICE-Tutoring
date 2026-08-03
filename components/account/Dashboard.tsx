import {
  CalendarDays,
  GraduationCap,
  LineChart,
  LogOut,
  MapPin,
  MessagesSquare,
  Video,
} from "lucide-react";
import { signOut } from "@/app/account/actions";
import { Button, LinkButton } from "@/components/ui/Button";
import { MessageThread, type ThreadMessage } from "./MessageThread";
import type {
  EnrollmentStatus,
  GradeBand,
  LessonFormat,
  LessonStatus,
} from "@/lib/database.types";
import { cn } from "@/lib/utils";

export type EnrollmentRow = {
  id: string;
  learner_name: string;
  grade_band: GradeBand;
  subject: string | null;
  status: EnrollmentStatus;
  created_at: string;
};

export type LessonRow = {
  id: string;
  learner_id: string;
  subject: string;
  starts_at: string;
  duration_minutes: number;
  format: LessonFormat;
  location: string | null;
  meeting_url: string | null;
  status: LessonStatus;
};

export type AssessmentRow = {
  id: string;
  learner_id: string;
  subject: string;
  title: string;
  term: string | null;
  score: number | null;
  max_score: number | null;
  grade: string | null;
  assessed_on: string;
  comment: string | null;
};

const gradeLabels: Record<GradeBand, string> = {
  primary: "Primary (P.1 – P.7)",
  middle: "Middle School (S.1 – S.4)",
  upper: "Upper Secondary (S.5 – S.6)",
};

const statusStyles: Record<EnrollmentStatus, { label: string; className: string }> = {
  new: { label: "Received", className: "border-cyan-brand/40 bg-cyan-brand/10 text-cyan-glow" },
  contacted: { label: "Contacted", className: "border-blue-glow/40 bg-blue-glow/10 text-blue-glow" },
  matched: { label: "Tutor matched", className: "border-gold/40 bg-gold/10 text-gold" },
  active: {
    label: "Active",
    className: "border-whatsapp-bright/40 bg-whatsapp/10 text-whatsapp-bright",
  },
  cancelled: { label: "Cancelled", className: "border-white/15 bg-white/5 text-slate-400" },
};

function SectionCard({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: typeof CalendarDays;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h3 className="flex items-center gap-3 font-display text-lg font-semibold text-white">
          <Icon className="h-5 w-5 text-cyan-brand" aria-hidden />
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="glass rounded-hud p-8 text-center text-slate-400">{children}</div>;
}

export function Dashboard({
  name,
  email,
  enrollments,
  learnerNames,
  lessons,
  assessments,
  messages,
}: {
  name: string;
  email: string;
  enrollments: EnrollmentRow[];
  learnerNames: Map<string, string>;
  lessons: LessonRow[];
  assessments: AssessmentRow[];
  messages: ThreadMessage[];
}) {
  const firstName = name.trim().split(/\s+/)[0] || "there";
  const now = Date.now();

  const upcoming = lessons.filter(
    (l) => l.status === "scheduled" && new Date(l.starts_at).getTime() >= now,
  );
  const past = lessons.filter(
    (l) => l.status !== "scheduled" || new Date(l.starts_at).getTime() < now,
  );

  return (
    <div className="container-ice">
      {/* ---------- Header ---------- */}
      <div className="edge-glow glass-strong relative mb-10 flex flex-wrap items-center justify-between gap-6 rounded-hud-lg p-8">
        <span aria-hidden className="aura -top-16 left-20 h-40 w-64 bg-cyan-brand/20" />
        <div className="relative">
          <span className="hud-label">Signed in</span>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">
            Welcome back, {firstName}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{email}</p>
        </div>
        <form action={signOut} className="relative">
          <Button type="submit" variant="ghost">
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </Button>
        </form>
      </div>

      {/* ---------- Upcoming lessons ---------- */}
      <SectionCard icon={CalendarDays} title="Lesson schedule">
        {upcoming.length === 0 ? (
          <Empty>
            No lessons scheduled yet. Once a tutor is matched, sessions appear here.
          </Empty>
        ) : (
          <ul className="space-y-4">
            {upcoming.map((l) => {
              const start = new Date(l.starts_at);
              return (
                <li
                  key={l.id}
                  className="edge-glow glass flex flex-wrap items-center justify-between gap-4 rounded-hud p-6"
                >
                  <div>
                    <strong className="font-display text-base font-semibold text-white">
                      {learnerNames.get(l.learner_id) ?? "Learner"} · {l.subject}
                    </strong>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
                      <span>
                        {start.toLocaleString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>· {l.duration_minutes} min</span>
                      <span className="inline-flex items-center gap-1.5">
                        {l.format === "online" ? (
                          <Video className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                        )}
                        {l.format === "online" ? "Online" : l.location || "In person"}
                      </span>
                    </p>
                  </div>
                  {l.format === "online" && l.meeting_url && (
                    <LinkButton href={l.meeting_url} variant="primary" external>
                      Join lesson
                    </LinkButton>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* ---------- Progress ---------- */}
      <SectionCard icon={LineChart} title="Progress reports">
        {assessments.length === 0 ? (
          <Empty>No assessments recorded yet.</Empty>
        ) : (
          <ul className="space-y-4">
            {assessments.map((a) => {
              const pct =
                a.score !== null && a.max_score
                  ? Math.round((a.score / a.max_score) * 100)
                  : null;
              return (
                <li key={a.id} className="edge-glow glass rounded-hud p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <strong className="font-display text-base font-semibold text-white">
                        {learnerNames.get(a.learner_id) ?? "Learner"} · {a.subject}
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
                    <span className="font-display text-xl font-bold text-cyan-glow">
                      {a.score !== null
                        ? `${a.score}${a.max_score ? ` / ${a.max_score}` : ""}`
                        : "—"}
                      {a.grade ? ` (${a.grade})` : ""}
                    </span>
                  </div>

                  {pct !== null && (
                    <div
                      className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
                      role="img"
                      aria-label={`${pct} percent`}
                    >
                      <div
                        className="h-full rounded-full bg-grad-brand"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  )}

                  {a.comment && (
                    <p className="mt-4 border-l-2 border-cyan-brand/40 pl-4 text-sm italic text-slate-300">
                      {a.comment}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* ---------- Messages ---------- */}
      <SectionCard icon={MessagesSquare} title="Message your tutor">
        <MessageThread messages={messages} />
      </SectionCard>

      {/* ---------- Enrollments ---------- */}
      <SectionCard
        icon={GraduationCap}
        title="Your enrollments"
        action={
          enrollments.length > 0 ? (
            <LinkButton href="/enroll" variant="ghost">
              Enroll another learner
            </LinkButton>
          ) : null
        }
      >
        {enrollments.length === 0 ? (
          <Empty>
            <p>You haven&rsquo;t enrolled a learner yet.</p>
            <div className="mt-6">
              <LinkButton href="/enroll" variant="primary">
                Enroll a learner
              </LinkButton>
            </div>
          </Empty>
        ) : (
          <ul className="space-y-4">
            {enrollments.map((e) => {
              const status = statusStyles[e.status];
              return (
                <li
                  key={e.id}
                  className="edge-glow glass flex flex-wrap items-center justify-between gap-4 rounded-hud p-6"
                >
                  <div>
                    <strong className="font-display text-base font-semibold text-white">
                      {e.learner_name}
                    </strong>
                    <p className="mt-1 text-sm text-slate-400">
                      {gradeLabels[e.grade_band]}
                      {e.subject ? ` · ${e.subject}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <time
                      dateTime={e.created_at}
                      className="font-hud text-[0.68rem] uppercase tracking-[0.18em] text-slate-500"
                    >
                      {new Date(e.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                    <span
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 font-hud text-[0.65rem] uppercase tracking-[0.16em]",
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* ---------- Lesson history ---------- */}
      {past.length > 0 && (
        <SectionCard icon={CalendarDays} title="Past lessons">
          <ul className="space-y-3">
            {past.map((l) => (
              <li
                key={l.id}
                className="glass flex flex-wrap items-center justify-between gap-3 rounded-hud px-6 py-4"
              >
                <span className="text-slate-300">
                  {learnerNames.get(l.learner_id) ?? "Learner"} · {l.subject}
                </span>
                <span className="flex items-center gap-4">
                  <time
                    dateTime={l.starts_at}
                    className="font-hud text-[0.68rem] uppercase tracking-[0.16em] text-slate-500"
                  >
                    {new Date(l.starts_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </time>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 font-hud text-[0.62rem] uppercase tracking-[0.14em]",
                      l.status === "completed"
                        ? "border-whatsapp-bright/40 bg-whatsapp/10 text-whatsapp-bright"
                        : "border-white/15 bg-white/5 text-slate-400",
                    )}
                  >
                    {l.status}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
