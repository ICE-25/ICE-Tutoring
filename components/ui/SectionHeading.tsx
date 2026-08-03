import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "mb-14 max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <span
        className={cn(
          "mb-5 inline-flex items-center gap-3",
          align === "center" && "justify-center",
        )}
      >
        <span aria-hidden className="h-px w-8 bg-grad-text" />
        <span className="hud-label">{eyebrow}</span>
        <span aria-hidden className="h-px w-8 bg-grad-text" />
      </span>
      <h2 className="text-display-md">{title}</h2>
      {lead && <p className="mt-5 text-lg text-slate-400">{lead}</p>}
    </Reveal>
  );
}
