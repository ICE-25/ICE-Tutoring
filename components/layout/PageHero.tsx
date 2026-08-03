import { NodeFieldBackdrop } from "@/components/visuals/Backdrops";
import { Reveal } from "@/components/ui/Reveal";

type PageHeroProps = {
  tag: string;
  title: React.ReactNode;
  lead: string;
};

/** Compact hero for the inner pages, matching the original `.page-hero`. */
export function PageHero({ tag, title, lead }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden pb-24 pt-16 sm:pt-20">
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(21,96,214,0.35),transparent_65%)]"
      />
      <span aria-hidden className="absolute inset-0 -z-10 grid-floor opacity-50 mask-fade-b" />
      <NodeFieldBackdrop className="-z-10 mask-fade-b opacity-70" />

      <div className="container-ice relative text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-cyan-brand/30 bg-cyan-brand/10 px-4 py-2 backdrop-blur-sm">
            <span
              aria-hidden
              className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-cyan-glow shadow-[0_0_10px_2px_rgba(111,227,255,0.9)]"
            />
            <span className="hud-label">{tag}</span>
          </span>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="mx-auto mt-7 max-w-4xl text-display-lg">{title}</h1>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">{lead}</p>
        </Reveal>
      </div>
    </section>
  );
}
