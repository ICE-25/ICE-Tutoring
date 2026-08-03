import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Stat } from "@/components/ui/Stat";
import { TiltImage } from "@/components/ui/TiltImage";
import { NodeFieldBackdrop } from "@/components/visuals/Backdrops";
import { waLinks } from "@/lib/site";

const stats = [
  { value: "9+", label: "Subjects tutored" },
  { value: "P.1 – S.6", label: "All grade levels" },
  { value: "Online & physical", label: "Class formats" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-28 pt-10 sm:pt-16">
      {/* Depth layers */}
      <span
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_60%_80%_at_85%_0%,rgba(52,199,244,0.22),transparent_60%),radial-gradient(ellipse_50%_60%_at_5%_100%,rgba(21,96,214,0.3),transparent_60%)]"
      />
      <span aria-hidden className="absolute inset-0 -z-20 grid-floor opacity-60 mask-fade-b" />
      <NodeFieldBackdrop className="-z-10 mask-fade-b" />

      <div className="container-ice relative grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ---------- Copy ---------- */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-cyan-brand/30 bg-cyan-brand/10 px-4 py-2 backdrop-blur-sm">
              <span
                aria-hidden
                className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-cyan-glow shadow-[0_0_10px_2px_rgba(111,227,255,0.9)]"
              />
              <span className="hud-label">Immaculate Child Education</span>
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-7 text-display-xl">
              Learn Today.
              <br />
              <span className="text-grad drop-shadow-[0_0_40px_rgba(52,199,244,0.35)]">
                Lead Tomorrow.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-7 max-w-[46ch] text-lg text-slate-400 sm:text-xl">
              ICE Tutoring gives your child expert-led STEM lessons, online or in person, with a
              friendly AI bot on hand whenever they&rsquo;re stuck.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap gap-4">
              <LinkButton href="/enroll" variant="primary" size="lg">
                Enroll a learner
              </LinkButton>
              <LinkButton href={waLinks.knowMore} variant="whatsapp" size="lg" external>
                Chat on WhatsApp
              </LinkButton>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="mt-14 flex flex-wrap gap-x-12 gap-y-8 border-t border-white/10 pt-9">
              {stats.map((s) => (
                <Stat key={s.label} value={s.value} label={s.label} />
              ))}
            </div>
          </Reveal>
        </div>

        {/* ---------- Floating 3D artwork ---------- */}
        <Reveal delay={0.2} y={40}>
          <TiltImage
            src="/assets/logo-icon.png"
            alt="ICE mascot — a scholar riding a low-poly ice horse, symbolising ICE Tutoring"
            width={620}
            height={620}
            intensity={13}
            priority
            sizes="(max-width: 1024px) 90vw, 460px"
            className="mx-auto max-w-[460px]"
          >
            {/* Live status badge, floating in front of the frame */}
            <span
              className="glass-strong absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-glow sm:-left-8"
              style={{ transform: "translateZ(55px)" }}
            >
              <Image
                src="/assets/mascot-chat.png"
                alt=""
                width={34}
                height={34}
                className="h-[34px] w-[34px] rounded-full object-cover ring-1 ring-cyan-brand/40"
              />
              <span
                aria-hidden
                className="h-2 w-2 animate-pulse-glow rounded-full bg-whatsapp-bright shadow-[0_0_10px_2px_rgba(52,245,140,0.8)]"
              />
              <span className="font-display text-sm font-semibold text-white">
                ICE Bot is online
              </span>
            </span>
          </TiltImage>
        </Reveal>
      </div>
    </section>
  );
}
