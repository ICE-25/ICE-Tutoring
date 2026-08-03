"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type StatProps = {
  /** Displayed verbatim, e.g. "9+", "24/7", "P.1 – S.6", "Online & physical". */
  value: string;
  label: string;
};

/**
 * Hero statistic. When the value starts with a number ("9+", "24/7", "1 tap")
 * that leading number counts up once the stat scrolls into view; the rest of
 * the string stays put. Purely textual values just fade in.
 */
export function Stat({ value, label }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();

  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";

  const [count, setCount] = useState(target === null || reduce ? target : 0);

  useEffect(() => {
    if (target === null || !inView || reduce) {
      if (target !== null) setCount(target);
      return;
    }
    const duration = 1100;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setCount(Math.round(eased * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, reduce]);

  return (
    <div ref={ref} className="group relative">
      <span
        aria-hidden
        className="absolute -left-4 top-1 h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-transparent via-cyan-brand/60 to-transparent"
      />
      <strong className="block font-display text-2xl font-bold tracking-tight text-white sm:text-[1.7rem]">
        {target !== null ? (
          <>
            <span className="tabular-nums">{count}</span>
            {suffix}
          </>
        ) : (
          value
        )}
      </strong>
      <span className="mt-1 block font-hud text-[0.7rem] uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
    </div>
  );
}
