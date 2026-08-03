"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger offset in seconds — use the item index for grids. */
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section";
};

/**
 * Scroll-triggered fade + rise. Collapses to a plain fade-in
 * (no movement) when the visitor prefers reduced motion.
 */
export function Reveal({ children, delay = 0, y = 26, className, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: reduce ? 0.2 : 0.7,
        delay: reduce ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}
