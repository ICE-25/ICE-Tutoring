"use client";

import { P5Canvas } from "./P5Canvas";
import { hexFieldSketch, nodeFieldSketch } from "./sketches";

/**
 * Client wrappers so server components can drop a generative backdrop in
 * without passing a sketch function across the server/client boundary.
 */

export function NodeFieldBackdrop({ className }: { className?: string }) {
  return <P5Canvas sketch={nodeFieldSketch} className={className} />;
}

export function HexFieldBackdrop({ className }: { className?: string }) {
  return <P5Canvas sketch={hexFieldSketch} className={className} />;
}
