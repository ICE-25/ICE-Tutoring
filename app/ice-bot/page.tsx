import type { Metadata } from "next";
import { Crosshair, MessageCircle, Zap } from "lucide-react";
import { ChatWidget } from "@/components/bot/ChatWidget";
import { LinkButton } from "@/components/ui/Button";
import { CtaPanel } from "@/components/ui/CtaPanel";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stat } from "@/components/ui/Stat";
import { TiltImage } from "@/components/ui/TiltImage";
import { HexFieldBackdrop, NodeFieldBackdrop } from "@/components/visuals/Backdrops";
import { waLinks } from "@/lib/site";

export const metadata: Metadata = {
  title: "ICE Bot — Your Study Buddy",
  description:
    "Your child's always-on study buddy — ask a question, get pointed to the right subject, then continue with a real tutor on WhatsApp.",
};

const stats = [
  { value: "24/7", label: "Always available" },
  { value: "Instant", label: "Subject guidance" },
  { value: "1 tap", label: "To a real tutor" },
];

const perks = [
  {
    icon: Zap,
    title: "Instant answers",
    body: "No waiting — ICE Bot responds the moment your child asks.",
  },
  {
    icon: Crosshair,
    title: "Points you right",
    body: "Directs each question to the correct subject or grade level.",
  },
  {
    icon: MessageCircle,
    title: "Hands off smoothly",
    body: "One tap moves the conversation to a real tutor on WhatsApp.",
  },
];

export default function IceBotPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden pb-28 pt-10 sm:pt-16">
        <span
          aria-hidden
          className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_60%_80%_at_85%_0%,rgba(52,199,244,0.22),transparent_60%),radial-gradient(ellipse_50%_60%_at_5%_100%,rgba(21,96,214,0.3),transparent_60%)]"
        />
        <span aria-hidden className="absolute inset-0 -z-20 grid-floor opacity-60 mask-fade-b" />
        <NodeFieldBackdrop className="-z-10 mask-fade-b" />

        <div className="container-ice relative grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2.5 rounded-full border border-cyan-brand/30 bg-cyan-brand/10 px-4 py-2 backdrop-blur-sm">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-cyan-glow shadow-[0_0_10px_2px_rgba(111,227,255,0.9)]"
                />
                <span className="hud-label">Meet the mascot</span>
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="mt-7 text-display-xl">
                Say hi to{" "}
                <span className="text-grad drop-shadow-[0_0_40px_rgba(52,199,244,0.35)]">
                  ICE Bot
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-7 max-w-[46ch] text-lg text-slate-400 sm:text-xl">
                Your child&rsquo;s always-on study buddy — ask a question, get pointed to the right
                subject, then continue with a real tutor on WhatsApp.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-14 flex flex-wrap gap-x-12 gap-y-8 border-t border-white/10 pt-9">
                {stats.map((s) => (
                  <Stat key={s.label} value={s.value} label={s.label} />
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} y={40}>
            <TiltImage
              src="/assets/mascot-chat.png"
              alt="ICE Bot mascot, a friendly white AI robot giving a thumbs up"
              width={520}
              height={520}
              intensity={13}
              priority
              sizes="(max-width: 1024px) 80vw, 380px"
              className="mx-auto max-w-[360px]"
              imageClassName="aspect-square object-cover"
            >
              <span
                className="glass-strong absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-glow"
                style={{ transform: "translateZ(55px)" }}
              >
                <span
                  aria-hidden
                  className="h-2 w-2 animate-pulse-glow rounded-full bg-whatsapp-bright shadow-[0_0_10px_2px_rgba(52,245,140,0.8)]"
                />
                <span className="font-display text-sm font-semibold text-white">Online now</span>
              </span>
            </TiltImage>
          </Reveal>
        </div>
      </section>

      {/* ---------- Live chat widget ---------- */}
      <section className="pb-24">
        <div className="container-ice">
          <Reveal y={40}>
            <ChatWidget />
          </Reveal>
        </div>
      </section>

      {/* ---------- Why learners like ICE Bot ---------- */}
      <section className="relative isolate overflow-hidden py-24">
        <HexFieldBackdrop className="-z-10 mask-fade-radial opacity-70" />
        <span aria-hidden className="aura -right-24 -top-20 h-96 w-96 bg-cyan-brand/15" />

        <div className="container-ice relative">
          <SectionHeading
            eyebrow="Why learners like ICE Bot"
            title={
              <>
                Quick help, then a <span className="text-grad">real tutor</span>
              </>
            }
          />
          <div className="grid gap-6 md:grid-cols-3">
            {perks.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <FeatureCard {...p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaPanel
        title="Prefer to chat on WhatsApp right away?"
        body="Skip the widget and message our tutors directly — we usually reply within minutes."
      >
        <LinkButton href={waLinks.knowMore} variant="light" size="lg" external>
          Chat on WhatsApp
        </LinkButton>
      </CtaPanel>
    </>
  );
}
