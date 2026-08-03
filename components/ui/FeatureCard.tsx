import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { HexIcon } from "./HexIcon";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  body?: string;
  href?: string;
  external?: boolean;
  /** Compact variant for dense grids like the subject tiles. */
  compact?: boolean;
  className?: string;
};

export function FeatureCard({
  icon,
  title,
  body,
  href,
  external,
  compact = false,
  className,
}: FeatureCardProps) {
  const inner = (
    <>
      {/* Corner tick — HUD detail */}
      <span
        aria-hidden
        className="absolute right-5 top-5 h-2 w-2 rounded-full bg-cyan-brand/40 transition-all duration-500 group-hover:bg-cyan-glow group-hover:shadow-[0_0_12px_2px_rgba(111,227,255,0.8)]"
      />

      <HexIcon icon={icon} size={compact ? "sm" : "md"} className={compact ? "mb-4" : "mb-6"} />

      <h3
        className={cn(
          "font-display font-semibold tracking-tight text-white",
          compact ? "text-base" : "text-xl",
        )}
      >
        {title}
      </h3>

      {body && (
        <p className={cn("mt-2.5 text-slate-400", compact ? "text-sm" : "text-[0.98rem]")}>
          {body}
        </p>
      )}
    </>
  );

  const classes = cn(
    "group edge-glow glass relative flex h-full flex-col rounded-hud transition-all duration-500",
    "hover:-translate-y-1.5 hover:shadow-glow",
    compact ? "items-center p-6 text-center" : "p-8",
    className,
  );

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {inner}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return <div className={classes}>{inner}</div>;
}
