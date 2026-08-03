import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type CtaPanelProps = {
  title: string;
  body: string;
  children: ReactNode;
};

/** The recurring closing call-to-action band, rebuilt as a glowing HUD console. */
export function CtaPanel({ title, body, children }: CtaPanelProps) {
  return (
    <section className="py-24">
      <div className="container-ice">
        <Reveal>
          <div className="relative overflow-hidden rounded-hud-lg p-px">
            {/* Animated gradient edge */}
            <span
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(115deg,#34C7F4,#1560D6_35%,#6FE3FF_60%,#0B2559)] bg-[length:220%_220%] animate-shimmer"
            />

            <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-gradient-to-br from-navy via-navy-deep to-abyss px-6 py-16 text-center sm:px-12">
              {/* Radial bloom + grid floor */}
              <span
                aria-hidden
                className="absolute inset-0 grid-floor opacity-60 mask-fade-radial"
              />
              <span
                aria-hidden
                className="aura -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 bg-cyan-brand/25"
              />

              <div className="relative mx-auto max-w-2xl">
                <h2 className="text-display-sm">{title}</h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">{body}</p>
                <div className="mt-9 flex flex-wrap justify-center gap-4">{children}</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
