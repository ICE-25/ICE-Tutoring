import type { Config } from "tailwindcss";

/**
 * ICE Tutoring — futuristic HUD design tokens.
 * Evolved from the original css/style.css brand palette (navy #0B2559,
 * blue #1560D6, cyan #34C7F4) toward the deeper, glowing look of the
 * cover-banner and mascot artwork.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#03070F",
        abyss: "#050C1B",
        navy: {
          deep: "#071634",
          DEFAULT: "#0B2559",
          soft: "#12336E",
        },
        blue: {
          brand: "#1560D6",
          glow: "#2E86FF",
        },
        cyan: {
          brand: "#34C7F4",
          soft: "#C8ECFB",
          glow: "#6FE3FF",
        },
        ice: "#F4F8FE",
        whatsapp: {
          DEFAULT: "#1FAE55",
          bright: "#34F58C",
        },
        gold: "#F5B21B",
      },
      fontFamily: {
        display: ["var(--font-display)", "Segoe UI", "sans-serif"],
        body: ["var(--font-body)", "Segoe UI", "sans-serif"],
        hud: ["var(--font-hud)", "Consolas", "monospace"],
      },
      fontSize: {
        // Larger, bolder scale than the original site
        "display-xl": ["clamp(3rem, 7.2vw, 6.5rem)", { lineHeight: "0.94", letterSpacing: "-0.035em" }],
        "display-lg": ["clamp(2.4rem, 5.4vw, 4.5rem)", { lineHeight: "1", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(2rem, 4vw, 3.25rem)", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "display-sm": ["clamp(1.5rem, 2.6vw, 2.15rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        hud: "1.5rem",
        "hud-lg": "2rem",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(52,199,244,0.18), 0 18px 60px -24px rgba(52,199,244,0.55)",
        "glow-lg": "0 0 0 1px rgba(52,199,244,0.28), 0 30px 90px -30px rgba(52,199,244,0.75)",
        card: "0 24px 70px -40px rgba(3,7,15,0.95)",
        inset: "inset 0 1px 0 0 rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "grad-brand": "linear-gradient(100deg, #0B2559 0%, #1560D6 55%, #34C7F4 100%)",
        "grad-text": "linear-gradient(100deg, #2E86FF 0%, #6FE3FF 100%)",
        "grad-edge":
          "linear-gradient(135deg, rgba(52,199,244,0.65), rgba(21,96,214,0.15) 45%, rgba(52,199,244,0.5))",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(-10px)" },
          "50%": { transform: "translateY(10px)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(500%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin-slow 18s linear infinite",
        "spin-slower": "spin-slow 34s linear infinite reverse",
        "pulse-glow": "pulse-glow 3.2s ease-in-out infinite",
        scanline: "scanline 7s linear infinite",
        shimmer: "shimmer 4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
