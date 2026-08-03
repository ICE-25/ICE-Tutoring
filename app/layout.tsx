import type { Metadata, Viewport } from "next";
import { Inter, Orbitron, Space_Grotesk } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const hud = Orbitron({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-hud",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ICE Tutoring — Learn Today. Lead Tomorrow.",
    template: "%s — ICE Tutoring",
  },
  description:
    "ICE Tutoring gives learners high-quality STEM education with expert tutors, online and physical classes, and a friendly AI study bot.",
  icons: { icon: "/assets/logo-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#03070F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${hud.variable}`}>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-display focus:text-sm focus:font-semibold focus:text-navy-deep"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
