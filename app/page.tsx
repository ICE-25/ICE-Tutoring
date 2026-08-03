import { GraduationCap, Target, TrendingUp } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { BotCallout } from "@/components/home/BotCallout";
import { FaqAccordion, type FaqItem } from "@/components/home/FaqAccordion";
import { LinkButton } from "@/components/ui/Button";
import { CtaPanel } from "@/components/ui/CtaPanel";
import { FacetDivider } from "@/components/ui/FacetDivider";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Reveal } from "@/components/ui/Reveal";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HexFieldBackdrop } from "@/components/visuals/Backdrops";

const features = [
  {
    icon: GraduationCap,
    title: "Small classes, real attention",
    body: "Small class sizes and one-on-one support, so no learner gets left behind.",
  },
  {
    icon: Target,
    title: "Exam-smart teaching",
    body: "Clear explanations, exam strategies, and past-paper practice built into every lesson.",
  },
  {
    icon: TrendingUp,
    title: "Progress you can see",
    body: "Regular assessments and progress tracking, so growth is visible, not guesswork.",
  },
];

const reviews = [
  {
    quote:
      "“My son's maths grade moved from a C to an A in one term. His ICE tutor explains things so patiently.”",
    name: "Nakato A.",
    role: "Parent, P.6 learner",
    initials: "NA",
  },
  {
    quote:
      "“The ICE Bot helps me revise chemistry at night, then links me straight to a tutor when I need more help.”",
    name: "Jonathan M.",
    role: "S.4 learner",
    initials: "JM",
  },
  {
    quote:
      "“Booking a physical class near our home in Ntinda was simple, and the exam prep was worth every shilling.”",
    name: "Sarah K.",
    role: "Parent, S.2 learner",
    initials: "SK",
  },
];

const faqs: FaqItem[] = [
  {
    q: "Which grades and subjects do you cover?",
    a: "Primary (P.1–P.7) through Upper Secondary (S.5–S.6), across Maths, Sciences, English, French, Coding, Robotics and more.",
  },
  {
    q: "Do you offer online or physical classes?",
    a: "Both. Choose whichever fits your family — live online sessions, in-person lessons, or a mix of the two.",
  },
  {
    q: "How do I enroll my child?",
    a: "Tap “Enroll” on this site or message us on WhatsApp, and our team will match you with the right tutor and schedule.",
  },
  {
    q: "Can ICE Bot really help with schoolwork?",
    a: "Yes — ICE Bot answers quick study questions any time, then connects you to a real tutor on WhatsApp for deeper help.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <FacetDivider />

      {/* ---------- Why ICE is different ---------- */}
      <section className="relative isolate overflow-hidden py-24">
        <HexFieldBackdrop className="-z-10 mask-fade-radial opacity-70" />
        <span aria-hidden className="aura -right-24 -top-20 h-96 w-96 bg-cyan-brand/15" />

        <div className="container-ice relative">
          <SectionHeading
            eyebrow="Why choose ICE"
            title={
              <>
                Built around how your child <span className="text-grad">actually learns</span>
              </>
            }
          />
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1}>
                <FeatureCard {...f} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Client reviews ---------- */}
      <section className="relative isolate overflow-hidden py-24">
        <span aria-hidden className="aura -bottom-24 -left-24 h-96 w-96 bg-blue-brand/20" />

        <div className="container-ice relative">
          <SectionHeading
            eyebrow="Parents & learners"
            title={
              <>
                Trusted by families across <span className="text-grad">Kampala</span>
              </>
            }
          />
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.name} delay={i * 0.1}>
                <ReviewCard {...r} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Common questions ---------- */}
      <section className="relative isolate overflow-hidden py-24">
        <div className="container-ice relative">
          <SectionHeading eyebrow="FAQ" title="Common questions" />
          <FaqAccordion items={faqs} />
        </div>
      </section>

      <BotCallout />

      <CtaPanel
        title="Ready to help your child excel?"
        body="Register today and get matched with an ICE tutor this week — online or physical, your choice."
      >
        <LinkButton href="/enroll" variant="light" size="lg">
          Register Now
        </LinkButton>
      </CtaPanel>
    </>
  );
}
