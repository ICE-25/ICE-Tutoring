import type { Metadata } from "next";
import {
  Atom,
  Backpack,
  BookOpen,
  Bot,
  Calculator,
  ClipboardCheck,
  Code2,
  FlaskConical,
  GraduationCap,
  Leaf,
  Laptop,
  Microscope,
  MessagesSquare,
  PencilLine,
  Sparkles,
  Sun,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { LinkButton } from "@/components/ui/Button";
import { CtaPanel } from "@/components/ui/CtaPanel";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HexFieldBackdrop } from "@/components/visuals/Backdrops";
import { waLinks } from "@/lib/site";

export const metadata: Metadata = {
  title: "Subjects & Programs",
  description:
    "From P.1 to S.6, ICE tutors cover the subjects that matter most — with clear paths for exams like PLE, UCE, and UACE.",
};

const levels = [
  {
    icon: Users,
    title: "Primary School",
    body: "P.1 – P.7 (Grades 1–6). Foundations in numeracy, literacy, and science.",
  },
  {
    icon: Backpack,
    title: "Middle School (KS3)",
    body: "S.1 – S.4 (Grades 7–10). Core subjects plus UCE exam preparation.",
  },
  {
    icon: GraduationCap,
    title: "Upper Secondary",
    body: "S.5 – S.6 (Grades 11–13). Advanced sciences and UACE-focused coaching.",
  },
];

const subjects = [
  { icon: Calculator, title: "Mathematics" },
  { icon: Microscope, title: "Science" },
  { icon: BookOpen, title: "English" },
  { icon: MessagesSquare, title: "French" },
  { icon: Atom, title: "Physics" },
  { icon: FlaskConical, title: "Chemistry" },
  { icon: Leaf, title: "Biology" },
  { icon: Code2, title: "Coding" },
  { icon: Bot, title: "Robotics" },
  { icon: Sparkles, title: "And more" },
];

const services = [
  {
    icon: UserRoundCheck,
    title: "One-to-one tutoring",
    body: "Focused, personal sessions built around one learner.",
  },
  {
    icon: Users,
    title: "Group classes",
    body: "Learn alongside peers at a similar level.",
  },
  {
    icon: Sun,
    title: "Holiday coaching",
    body: "Keep progress going during school breaks.",
  },
  {
    icon: PencilLine,
    title: "Homework support",
    body: "Daily help finishing assignments with understanding.",
  },
  {
    icon: ClipboardCheck,
    title: "Exam preparation",
    body: "Past papers and strategy for PLE, UCE, UACE.",
  },
  {
    icon: Laptop,
    title: "Online & physical",
    body: "Join from home or in person — your choice.",
  },
];

export default function SubjectsPage() {
  return (
    <>
      <PageHero
        tag="Subjects & Programs"
        title={
          <>
            Every core subject, <span className="text-grad">every grade band</span>
          </>
        }
        lead="From P.1 to S.6, ICE tutors cover the subjects that matter most — with clear paths for exams like PLE, UCE, and UACE."
      />

      {/* ---------- Grade levels ---------- */}
      <section className="py-20">
        <div className="container-ice">
          <SectionHeading eyebrow="Classes for all grades" title="Find your learner's level" />
          <div className="grid gap-6 md:grid-cols-3">
            {levels.map((l, i) => (
              <Reveal key={l.title} delay={i * 0.1}>
                <FeatureCard {...l} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Subjects ---------- */}
      <section className="relative isolate overflow-hidden py-24">
        <HexFieldBackdrop className="-z-10 mask-fade-radial opacity-70" />
        <span aria-hidden className="aura -left-24 -top-20 h-96 w-96 bg-blue-brand/20" />

        <div className="container-ice relative">
          <SectionHeading
            eyebrow="Subjects we tutor"
            title={
              <>
                STEM-first, <span className="text-grad">exam-ready</span>
              </>
            }
          />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {subjects.map((s, i) => (
              <Reveal key={s.title} delay={(i % 5) * 0.07}>
                <FeatureCard {...s} compact />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section className="py-20">
        <div className="container-ice">
          <SectionHeading
            eyebrow="Available services"
            title="Learn the way that suits your family"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={(i % 3) * 0.1}>
                <FeatureCard {...s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaPanel
        title="Not sure which subject to start with?"
        body="Message ICE Bot or a tutor on WhatsApp and we'll recommend the right starting point."
      >
        <LinkButton href="/enroll" variant="light" size="lg">
          Enroll now
        </LinkButton>
        <LinkButton href={waLinks.chooseSubject} variant="whatsapp" size="lg" external>
          Ask on WhatsApp
        </LinkButton>
      </CtaPanel>
    </>
  );
}
