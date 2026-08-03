import { Star } from "lucide-react";

type ReviewCardProps = {
  quote: string;
  name: string;
  role: string;
  initials: string;
};

export function ReviewCard({ quote, name, role, initials }: ReviewCardProps) {
  return (
    <figure className="group edge-glow glass relative flex h-full flex-col rounded-hud p-8 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-glow">
      <span
        aria-hidden
        className="pointer-events-none absolute right-6 top-4 font-display text-7xl leading-none text-cyan-brand/10 transition-colors duration-500 group-hover:text-cyan-brand/20"
      >
        &rdquo;
      </span>

      <div className="mb-5 flex gap-1" aria-label="Rated 5 out of 5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 fill-gold text-gold drop-shadow-[0_0_6px_rgba(245,178,27,0.55)]"
            aria-hidden
          />
        ))}
      </div>

      <blockquote className="relative flex-1 text-[1.02rem] leading-relaxed text-slate-200">
        {quote}
      </blockquote>

      <figcaption className="mt-7 flex items-center gap-3.5 border-t border-white/10 pt-6">
        <span
          aria-hidden
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-grad-brand font-display text-sm font-bold text-white shadow-[0_0_18px_-4px_rgba(52,199,244,0.9)]"
        >
          {initials}
        </span>
        <span>
          <strong className="block font-display text-sm font-semibold text-white">{name}</strong>
          <span className="text-[0.8rem] text-slate-400">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}
