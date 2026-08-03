"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

type TiltImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Max rotation in degrees. */
  intensity?: number;
  /** Idle bobbing animation. */
  float?: boolean;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  /** Optional overlay node rendered in front of the image, e.g. a status badge. */
  children?: React.ReactNode;
  sizes?: string;
};

/**
 * Floating 3D artwork. The frame gently bobs on its own, then tilts and
 * parallaxes toward the cursor on hover, with the cyan aura behind it
 * brightening as the pointer approaches. Motion is fully disabled for
 * visitors who prefer reduced motion — the image simply sits still.
 */
export function TiltImage({
  src,
  alt,
  width,
  height,
  intensity = 12,
  float = true,
  priority = false,
  className,
  imageClassName,
  children,
  sizes,
}: TiltImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Normalised pointer position within the element (0 → 1 on each axis).
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);

  const spring = { stiffness: 140, damping: 18, mass: 0.6 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const sHover = useSpring(hover, { stiffness: 120, damping: 20 });

  const rotateY = useTransform(sx, [0, 1], [-intensity, intensity]);
  const rotateX = useTransform(sy, [0, 1], [intensity, -intensity]);
  const glowOpacity = useTransform(sHover, [0, 1], [0.35, 0.95]);
  const glowScale = useTransform(sHover, [0, 1], [0.9, 1.08]);
  const lift = useTransform(sHover, [0, 1], [0, -6]);

  // Specular sheen that tracks the cursor across the artwork.
  const sheenX = useTransform(sx, [0, 1], ["0%", "100%"]);
  const sheenY = useTransform(sy, [0, 1], ["0%", "100%"]);
  const sheen = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.22), transparent 55%)`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handleLeave() {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  }

  return (
    <div className={cn("perspective-1000 relative", float && !reduce && "animate-float", className)}>
      {/* Aura behind the artwork */}
      <motion.span
        aria-hidden
        style={{ opacity: reduce ? 0.4 : glowOpacity, scale: reduce ? 1 : glowScale }}
        className="pointer-events-none absolute inset-4 rounded-[2.5rem] bg-gradient-to-br from-cyan-brand/50 via-blue-brand/40 to-transparent blur-3xl"
      />

      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseEnter={() => !reduce && hover.set(1)}
        onMouseLeave={handleLeave}
        style={
          reduce
            ? undefined
            : { rotateX, rotateY, y: lift, transformStyle: "preserve-3d" }
        }
        className="preserve-3d relative"
      >
        {/* Gradient frame */}
        <div className="relative rounded-hud-lg bg-gradient-to-br from-cyan-brand/70 via-blue-brand/30 to-cyan-brand/50 p-px shadow-glow-lg">
          <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-abyss">
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              sizes={sizes}
              className={cn("h-auto w-full", imageClassName)}
            />

            {/* Cursor-tracking sheen */}
            {!reduce && (
              <motion.span
                aria-hidden
                style={{ backgroundImage: sheen, opacity: sHover }}
                className="pointer-events-none absolute inset-0 mix-blend-overlay"
              />
            )}

            {/* HUD corner brackets */}
            <span aria-hidden className="pointer-events-none absolute inset-0">
              {[
                "left-3 top-3 border-l-2 border-t-2",
                "right-3 top-3 border-r-2 border-t-2",
                "bottom-3 left-3 border-b-2 border-l-2",
                "bottom-3 right-3 border-b-2 border-r-2",
              ].map((pos) => (
                <span
                  key={pos}
                  className={cn("absolute h-5 w-5 border-cyan-glow/70", pos)}
                />
              ))}
            </span>
          </div>
        </div>

        {children}
      </motion.div>
    </div>
  );
}
