export type Quality = "low" | "medium" | "high";

/**
 * Picks a rendering tier for the p5 sketches so phones and low-core
 * machines get a lighter scene instead of a stuttering one.
 */
export function getQuality(): Quality {
  if (typeof window === "undefined") return "low";

  const cores = navigator.hardwareConcurrency ?? 4;
  // deviceMemory is Chromium-only; treat "unknown" as mid-range.
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const width = window.innerWidth;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  if (width < 768 || cores <= 2 || memory <= 2) return "low";
  if (coarse || cores <= 4 || memory <= 4 || width < 1280) return "medium";
  return "high";
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
