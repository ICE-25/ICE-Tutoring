import Link from "next/link";
import { ArrowRight, GraduationCap, Users } from "lucide-react";
import { HexIcon } from "@/components/ui/HexIcon";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The two routes into the platform, placed immediately below the hero.
 *
 * Both sides of the marketplace need a visible entry point: parents to enrol,
 * and tutors to apply. Without this the tutor path lived only in the footer,
 * which meant the supply side was effectively invisible to anyone landing on
 * the homepage.
 */
const paths = [
  {
    icon: Users,
    eyebrow: "For parents & learners",
    title: "Enrol a learner",
    body: "Pick your curriculum and class, tell us the subject, and we'll match a tutor within a day.",
    href: "/enroll",
    cta: "Start enrolment",
    accent: "from-cyan-brand/25",
  },
  {
    icon: GraduationCap,
    eyebrow: "For tutors",
    title: "Teach with ICE",
    body: "Tell us your subjects, curricula and availability. Every application is reviewed by a person.",
    href: "/become-a-tutor",
    cta: "Apply to teach",
    accent: "from-gold/25",
  },
];

export function PathChooser() {
  return (
    <section className="relative isolate py-20">
      <div className="container-ice">
        <div className="grid gap-6 md:grid-cols-2">
          {paths.map((p, i) => (
            <Reveal key={p.href} delay={i * 0.1}>
              <Link
                href={p.href}
                className="group edge-glow glass-strong relative flex h-full flex-col overflow-hidden rounded-hud-lg p-8 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-glow sm:p-10"
              >
                <span
                  aria-hidden
                  className={`aura -right-16 -top-16 h-56 w-56 bg-gradient-to-br ${p.accent} to-transparent`}
                />

                <div className="relative">
                  <HexIcon icon={p.icon} size="md" className="mb-6" />
                  <span className="hud-label">{p.eyebrow}</span>
                  <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[1.02rem] text-slate-400">{p.body}</p>
                </div>

                <span className="relative mt-8 inline-flex items-center gap-2 font-display text-sm font-semibold text-cyan-glow">
                  {p.cta}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
