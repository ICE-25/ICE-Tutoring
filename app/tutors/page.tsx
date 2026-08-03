import type { Metadata } from "next";
import {
  Award,
  BarChart3,
  FileCheck2,
  MonitorPlay,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { LinkButton } from "@/components/ui/Button";
import { CtaPanel } from "@/components/ui/CtaPanel";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltImage } from "@/components/ui/TiltImage";
import { HexFieldBackdrop } from "@/components/visuals/Backdrops";
import { waLinks } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Tutors",
  description:
    "Our tutors are experienced, patient, and focused on one outcome — your child's confidence and results.",
};

const differences = [
  {
    icon: Award,
    title: "Experienced tutors",
    body: "Qualified educators who know the curriculum inside out.",
  },
  {
    icon: MonitorPlay,
    title: "Interactive lessons",
    body: "Online and physical lessons that keep learners engaged.",
  },
  {
    icon: Target,
    title: "Personalized learning",
    body: "Lessons paced to each learner's strengths and gaps.",
  },
  {
    icon: TrendingUp,
    title: "Better results",
    body: "Tracked progress that shows up in real grades.",
  },
];

const promises = [
  {
    icon: Users,
    title: "Small class sizes",
    body: "One-on-one support so every learner is seen.",
  },
  {
    icon: Target,
    title: "Clear exam strategy",
    body: "Explanations built for how PLE, UCE, and UACE are marked.",
  },
  {
    icon: BarChart3,
    title: "Regular assessments",
    body: "Progress tracked and shared, not left to guesswork.",
  },
  {
    icon: FileCheck2,
    title: "Homework & past papers",
    body: "Practical support between lessons, not just during them.",
  },
];

export default function TutorsPage() {
  return (
    <>
      <PageHero
        tag="ICE Educators"
        title={
          <>
            Remoulding students into <span className="text-grad">masterpieces</span>
          </>
        }
        lead="Our tutors are experienced, patient, and focused on one outcome — your child's confidence and results."
      />

      {/* ---------- Brand banner ---------- */}
      <section className="pb-20">
        <div className="container-ice">
          <Reveal y={40}>
            <TiltImage
              src="/assets/cover-banner.png"
              alt="ICE Tutoring banner showing the ICE scholar mascot and subjects taught"
              width={1989}
              height={795}
              intensity={6}
              float={false}
              sizes="(max-width: 1220px) 95vw, 1160px"
            />
          </Reveal>
        </div>
      </section>

      {/* ---------- What makes our tutors different ---------- */}
      <section className="py-20">
        <div className="container-ice">
          <SectionHeading
            eyebrow="What makes our tutors different"
            title={
              <>
                Experienced. Personal. <span className="text-grad">Results-driven.</span>
              </>
            }
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {differences.map((d, i) => (
              <Reveal key={d.title} delay={i * 0.08}>
                <FeatureCard {...d} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Our promise ---------- */}
      <section className="relative isolate overflow-hidden py-24">
        <HexFieldBackdrop className="-z-10 mask-fade-radial opacity-70" />
        <span aria-hidden className="aura -bottom-20 -right-24 h-96 w-96 bg-cyan-brand/15" />

        <div className="container-ice relative">
          <SectionHeading
            eyebrow="Our promise"
            title={
              <>
                Your future is <span className="text-grad">our mission</span>
              </>
            }
          />
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {promises.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <FeatureCard {...p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Beyond the lesson ---------- */}
      <section className="py-20">
        <div className="container-ice">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal y={40}>
              <TiltImage
                src="/assets/mascot-washstation.png"
                alt="ICE Bot mascot with a learner at an ICE-branded smart wash station"
                width={1417}
                height={1129}
                intensity={9}
                float={false}
                sizes="(max-width: 1024px) 92vw, 560px"
              />
            </Reveal>

            <Reveal delay={0.12}>
              <div>
                <span className="mb-5 inline-flex items-center gap-3">
                  <span aria-hidden className="h-px w-8 bg-grad-text" />
                  <span className="hud-label">Beyond the lesson</span>
                </span>
                <h2 className="text-display-sm">
                  Care that shows up <span className="text-grad">outside class too</span>
                </h2>
                <p className="mt-5 text-lg text-slate-400">
                  ICE Educators model discipline and care in every setting — from the classroom to
                  everyday habits — so learners see excellence as a lifestyle, not just a subject.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaPanel
        title="Meet the tutor who's right for your child"
        body="Tell us the subject and grade, and we'll match a tutor within a day."
      >
        <LinkButton href="/enroll" variant="light" size="lg">
          Get matched
        </LinkButton>
        <LinkButton href={waLinks.matchTutor} variant="whatsapp" size="lg" external>
          Ask on WhatsApp
        </LinkButton>
      </CtaPanel>
    </>
  );
}
