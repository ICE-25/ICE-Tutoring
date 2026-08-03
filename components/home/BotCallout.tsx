import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TiltImage } from "@/components/ui/TiltImage";
import { waLinks } from "@/lib/site";

export function BotCallout() {
  return (
    <section className="py-24">
      <div className="container-ice">
        <Reveal>
          <div className="glass-strong relative overflow-hidden rounded-hud-lg p-8 sm:p-12 lg:p-16">
            <span aria-hidden className="absolute inset-0 grid-floor opacity-40" />
            <span
              aria-hidden
              className="aura -right-20 top-0 h-80 w-80 bg-cyan-brand/25"
            />

            <div className="relative grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
              <TiltImage
                src="/assets/mascot-chat.png"
                alt="ICE Bot mascot, a friendly white AI robot giving a thumbs up"
                width={520}
                height={520}
                intensity={10}
                sizes="(max-width: 1024px) 70vw, 340px"
                className="mx-auto max-w-[300px] lg:max-w-none"
                imageClassName="aspect-square object-cover"
              />

              <div>
                <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-whatsapp-bright shadow-[0_0_10px_2px_rgba(52,245,140,0.8)]"
                  />
                  <span className="hud-label !text-whatsapp-bright">Always on</span>
                </span>

                <h2 className="mt-6 text-display-sm">
                  Meet <span className="text-grad">ICE Bot</span>, your child&rsquo;s study buddy
                </h2>

                <p className="mt-5 max-w-xl text-lg text-slate-400">
                  ICE Bot answers quick subject questions, suggests practice, and hands off to a
                  real tutor on WhatsApp the moment you need one.
                </p>

                <div className="mt-9 flex flex-wrap gap-4">
                  <LinkButton href="/ice-bot" variant="primary">
                    Chat with ICE Bot
                  </LinkButton>
                  <LinkButton href={waLinks.knowMore} variant="whatsapp" external>
                    Go straight to WhatsApp
                  </LinkButton>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
