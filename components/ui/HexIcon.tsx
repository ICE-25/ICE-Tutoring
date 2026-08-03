import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type HexIconProps = {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: { box: "h-14 w-14", icon: "h-6 w-6" },
  md: { box: "h-[4.5rem] w-[4.5rem]", icon: "h-8 w-8" },
  lg: { box: "h-24 w-24", icon: "h-11 w-11" },
};

/**
 * Hexagonal HUD badge — the futuristic successor to the original
 * `.feature-card .icon` circle, including its dashed orbit ring
 * (now two counter-rotating rings).
 */
export function HexIcon({ icon: Icon, size = "md", className }: HexIconProps) {
  const s = sizes[size];

  return (
    <div className={cn("relative inline-grid place-items-center", s.box, className)}>
      {/* Counter-rotating dashed orbit rings */}
      <span
        aria-hidden
        className="absolute -inset-1.5 animate-spin-slow rounded-full border border-dashed border-cyan-brand/30"
      />
      <span
        aria-hidden
        className="absolute -inset-3 animate-spin-slower rounded-full border border-dotted border-blue-glow/20"
      />

      {/* Hex plate */}
      <span
        aria-hidden
        className="absolute inset-0 bg-grad-brand transition-all duration-500 group-hover:brightness-125"
        style={{
          clipPath:
            "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
          boxShadow: "0 12px 34px -12px rgba(52,199,244,0.85)",
        }}
      />
      {/* Inner bevel highlight */}
      <span
        aria-hidden
        className="absolute inset-[2px] bg-gradient-to-b from-white/25 to-transparent opacity-60"
        style={{
          clipPath:
            "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
        }}
      />

      <Icon
        className={cn("relative z-10 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]", s.icon)}
        strokeWidth={1.6}
        aria-hidden
      />
    </div>
  );
}
