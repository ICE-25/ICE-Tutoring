import type { SketchFactory } from "./P5Canvas";

const CYAN = [52, 199, 244] as const;
const GLOW = [111, 227, 255] as const;
const BLUE = [46, 134, 255] as const;

/**
 * Hero backdrop — a drifting constellation of nodes that wire themselves
 * together when they come close, with faint low-poly facets floating behind.
 * The cursor pulls a brighter web of links around itself.
 */
export const nodeFieldSketch: SketchFactory =
  ({ quality, reduced, el }) =>
  (p) => {
    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    type Facet = { x: number; y: number; s: number; rot: number; spin: number; a: number };

    const NODES = { low: 24, medium: 46, high: 72 }[quality];
    const FACETS = { low: 3, medium: 6, high: 9 }[quality];
    const LINK = { low: 130, medium: 150, high: 168 }[quality];
    const MOUSE_LINK = 190;

    let nodes: Node[] = [];
    let facets: Facet[] = [];
    let w = 0;
    let h = 0;

    function build() {
      w = el.clientWidth;
      h = el.clientHeight;

      nodes = Array.from({ length: NODES }, () => ({
        x: p.random(w),
        y: p.random(h),
        vx: p.random(-0.24, 0.24),
        vy: p.random(-0.24, 0.24),
        r: p.random(1.1, 2.7),
      }));

      facets = Array.from({ length: FACETS }, () => ({
        x: p.random(w),
        y: p.random(h),
        s: p.random(46, 130),
        rot: p.random(p.TWO_PI),
        spin: p.random(-0.0016, 0.0016),
        a: p.random(6, 16),
      }));
    }

    p.setup = () => {
      const c = p.createCanvas(el.clientWidth, el.clientHeight);
      c.style("display", "block");
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, quality === "high" ? 2 : 1.5));
      build();
      if (reduced) {
        p.redraw();
        p.noLoop();
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(el.clientWidth, el.clientHeight);
      build();
      if (reduced) p.redraw();
    };

    p.draw = () => {
      p.clear();

      // --- low-poly facets drifting behind everything ---
      p.noFill();
      for (const f of facets) {
        if (!reduced) f.rot += f.spin;
        p.push();
        p.translate(f.x, f.y);
        p.rotate(f.rot);
        p.stroke(CYAN[0], CYAN[1], CYAN[2], f.a);
        p.strokeWeight(1);
        p.triangle(0, -f.s * 0.6, f.s * 0.55, f.s * 0.42, -f.s * 0.55, f.s * 0.42);
        p.pop();
      }

      const mx = p.mouseX;
      const my = p.mouseY;
      const mouseInside = mx > 0 && mx < w && my > 0 && my < h;

      // --- links between nodes ---
      p.strokeWeight(1);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          const t = 1 - Math.sqrt(d2) / LINK;
          p.stroke(BLUE[0], BLUE[1], BLUE[2], t * 46);
          p.line(a.x, a.y, b.x, b.y);
        }

        // --- brighter web around the cursor ---
        if (mouseInside) {
          const dx = a.x - mx;
          const dy = a.y - my;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MOUSE_LINK) {
            const t = 1 - d / MOUSE_LINK;
            p.stroke(GLOW[0], GLOW[1], GLOW[2], t * 78);
            p.line(a.x, a.y, mx, my);
            // gentle drift toward the pointer
            if (!reduced) {
              a.vx += (dx / d) * -0.006 * t;
              a.vy += (dy / d) * -0.006 * t;
            }
          }
        }
      }

      // --- nodes ---
      p.noStroke();
      for (const n of nodes) {
        p.fill(GLOW[0], GLOW[1], GLOW[2], 26);
        p.circle(n.x, n.y, n.r * 5.5);
        p.fill(GLOW[0], GLOW[1], GLOW[2], 190);
        p.circle(n.x, n.y, n.r * 1.7);

        if (reduced) continue;

        n.x += n.vx;
        n.y += n.vy;
        // keep speed in check after cursor nudges
        n.vx = p.constrain(n.vx * 0.995, -0.5, 0.5);
        n.vy = p.constrain(n.vy * 0.995, -0.5, 0.5);

        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }
    };
  };

/**
 * Section backdrop — a honeycomb of hexagons breathing on Perlin noise,
 * the animated successor to the static faceted SVG pattern.
 */
export const hexFieldSketch: SketchFactory =
  ({ quality, reduced, el }) =>
  (p) => {
    const R = { low: 44, medium: 36, high: 30 }[quality];
    let w = 0;
    let h = 0;
    let t = 0;

    function hexagon(x: number, y: number, r: number) {
      p.beginShape();
      for (let i = 0; i < 6; i++) {
        const a = (p.TWO_PI / 6) * i - p.PI / 6;
        p.vertex(x + Math.cos(a) * r, y + Math.sin(a) * r);
      }
      p.endShape(p.CLOSE);
    }

    p.setup = () => {
      const c = p.createCanvas(el.clientWidth, el.clientHeight);
      c.style("display", "block");
      p.pixelDensity(1);
      p.noiseDetail(2, 0.5);
      w = el.clientWidth;
      h = el.clientHeight;
      if (reduced) {
        p.redraw();
        p.noLoop();
      } else {
        p.frameRate(30); // the pulse is slow — no need for 60fps
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(el.clientWidth, el.clientHeight);
      w = el.clientWidth;
      h = el.clientHeight;
      if (reduced) p.redraw();
    };

    p.draw = () => {
      p.clear();
      p.noFill();
      p.strokeWeight(1);

      const dx = R * 1.732; // horizontal spacing for pointy-top hexes
      const dy = R * 1.5;

      for (let row = 0, y = -R; y < h + R; row++, y += dy) {
        const offset = row % 2 === 0 ? 0 : dx / 2;
        for (let x = -R + offset; x < w + R; x += dx) {
          const n = p.noise(x * 0.006, y * 0.006, t);
          const alpha = p.map(n, 0.25, 0.8, 0, 34, true);
          if (alpha < 1.5) continue;

          p.stroke(CYAN[0], CYAN[1], CYAN[2], alpha);
          hexagon(x, y, R * 0.92);

          // occasional bright "data" cell
          if (n > 0.735) {
            p.fill(GLOW[0], GLOW[1], GLOW[2], (n - 0.735) * 90);
            hexagon(x, y, R * 0.55);
            p.noFill();
          }
        }
      }

      if (!reduced) t += 0.0022;
    };
  };
