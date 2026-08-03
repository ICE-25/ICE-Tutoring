import type { Metadata } from "next";
import { CalendarDays, LineChart, MessagesSquare } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { AccountForm } from "@/components/forms/AccountForm";
import { Dashboard } from "@/components/account/Dashboard";
import { LinkButton } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HexFieldBackdrop } from "@/components/visuals/Backdrops";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account",
  description: "Track lessons, message your tutor, and manage enrollment in one place.",
};

// Session-dependent, so never statically cached.
export const dynamic = "force-dynamic";

const perks = [
  {
    icon: CalendarDays,
    title: "Lesson schedule",
    body: "See upcoming online and physical sessions at a glance.",
  },
  {
    icon: LineChart,
    title: "Progress reports",
    body: "Track assessments and improvement over each term.",
  },
  {
    icon: MessagesSquare,
    title: "Direct tutor chat",
    body: "Message your assigned tutor or ICE Bot any time.",
  },
];

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  // ---------- Signed in ----------
  if (supabase && user) {
    // RLS scopes every one of these to the caller, so no explicit filtering
    // is needed on lessons/assessments — they reach the parent through
    // learners.parent_id via the owns_learner() policy.
    const [
      { data: profile },
      { data: enrollments },
      { data: learners },
      { data: lessons },
      { data: assessments },
      { data: conversation },
    ] = await Promise.all([
      supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle(),
      supabase
        .from("enrollments")
        .select("id, learner_name, grade_band, subject, status, created_at")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("learners").select("id, full_name"),
      supabase
        .from("lessons")
        .select(
          "id, learner_id, subject, starts_at, duration_minutes, format, location, meeting_url, status",
        )
        .order("starts_at", { ascending: true }),
      supabase
        .from("assessments")
        .select(
          "id, learner_id, subject, title, term, score, max_score, grade, assessed_on, comment",
        )
        .order("assessed_on", { ascending: false }),
      supabase
        .from("conversations")
        .select("id")
        .eq("parent_id", user.id)
        .order("last_message_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const { data: rawMessages } = conversation
      ? await supabase
          .from("messages")
          .select("id, body, created_at, sender_id")
          .eq("conversation_id", conversation.id)
          .order("created_at", { ascending: true })
      : { data: [] };

    const messages = (rawMessages ?? []).map((m) => ({
      id: m.id,
      body: m.body,
      created_at: m.created_at,
      mine: m.sender_id === user.id,
    }));

    const learnerNames = new Map(
      (learners ?? []).map((l) => [l.id, l.full_name] as const),
    );

    return (
      <>
        <PageHero
          tag="Your account"
          title={
            <>
              Your ICE <span className="text-grad">dashboard</span>
            </>
          }
          lead="Track lessons, message your tutor, and manage enrollment in one place."
        />
        {/* Admins keep their own parent view — this only signposts the console
            rather than redirecting, since an admin may also be a parent. */}
        {profile?.role === "admin" && (
          <section className="pb-8">
            <div className="container-ice">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-hud border border-gold/30 bg-gold/[0.07] p-6">
                <p className="text-sm text-slate-200">
                  You&rsquo;re signed in as an <strong className="text-gold">admin</strong>.
                  This page shows your own parent view.
                </p>
                <LinkButton href="/admin" variant="ghost">
                  Open admin console
                </LinkButton>
              </div>
            </div>
          </section>
        )}

        <section className="pb-24">
          <Dashboard
            name={profile?.full_name || user.email || ""}
            email={user.email ?? ""}
            enrollments={enrollments ?? []}
            learnerNames={learnerNames}
            lessons={lessons ?? []}
            assessments={assessments ?? []}
            messages={messages}
          />
        </section>
      </>
    );
  }

  // ---------- Signed out ----------
  return (
    <>
      <PageHero
        tag="Your account"
        title={
          <>
            Log in or <span className="text-grad">create an account</span>
          </>
        }
        lead="Track lessons, message your tutor, and manage enrollment in one place."
      />

      <section className="pb-24">
        <div className="container-ice">
          <Reveal y={40}>
            <AccountForm />
          </Reveal>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-t border-white/5 py-24">
        <HexFieldBackdrop className="-z-10 mask-fade-radial opacity-70" />

        <div className="container-ice relative">
          <SectionHeading eyebrow="Once you're in" title="What your account gives you" />
          <div className="grid gap-6 md:grid-cols-3">
            {perks.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <FeatureCard {...p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
