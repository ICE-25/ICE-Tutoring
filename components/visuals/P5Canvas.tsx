"use client";

import { useEffect, useRef } from "react";
import type p5Type from "p5";
import { getQuality, prefersReducedMotion, type Quality } from "@/lib/perf";
import { cn } from "@/lib/utils";

export type SketchContext = {
  quality: Quality;
  reduced: boolean;
  el: HTMLElement;
};

export type SketchFactory = (ctx: SketchContext) => (p: p5Type) => void;

type P5CanvasProps = {
  sketch: SketchFactory;
  className?: string;
};

/**
 * Client-only p5 host. p5 touches `window` at import time, so it is
 * dynamically imported inside the effect. The sketch is paused whenever the
 * canvas scrolls out of view, and renders a single static frame for visitors
 * who prefer reduced motion.
 */
export function P5Canvas({ sketch, className }: P5CanvasProps) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = holder.current;
    if (!el) return;

    let instance: p5Type | undefined;
    let observer: IntersectionObserver | undefined;
    let cancelled = false;

    (async () => {
      const P5 = (await import("p5")).default;
      if (cancelled || !holder.current) return;

      const reduced = prefersReducedMotion();
      instance = new P5(sketch({ quality: getQuality(), reduced, el }), el);

      if (reduced) return; // the sketch calls noLoop() after one frame

      observer = new IntersectionObserver(
        ([entry]) => {
          if (!instance) return;
          if (entry.isIntersecting) instance.loop();
          else instance.noLoop();
        },
        { threshold: 0 },
      );
      observer.observe(el);
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      instance?.remove();
    };
  }, [sketch]);

  return (
    <div
      ref={holder}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    />
  );
}
