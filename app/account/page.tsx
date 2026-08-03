import type { Metadata } from "next";
import { CalendarDays, LineChart, MessagesSquare } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { AccountForm } from "@/components/forms/AccountForm";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HexFieldBackdrop } from "@/components/visuals/Backdrops";

export const metadata: Metadata = {
  title: "Account",
  description: "Track lessons, message your tutor, and manage enrollment in one place.",
};

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

export default function AccountPage() {
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
