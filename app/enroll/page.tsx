import type { Metadata } from "next";
import { Bot, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { EnrollForm } from "@/components/forms/EnrollForm";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { waLinks } from "@/lib/site";
import { getReferenceData } from "@/lib/curriculum";
import { TURNSTILE_SITE_KEY } from "@/lib/turnstile";

export const metadata: Metadata = {
  title: "Enroll",
  description:
    "Fill in the form, or message us on WhatsApp — we'll match a tutor within a day.",
};

// Reference data comes from the database, so this can't be fully prerendered.
export const dynamic = "force-dynamic";

export default async function EnrollPage() {
  const { curricula, classLevels, subjects } = await getReferenceData();

  return (
    <>
      <PageHero
        tag="Enroll today"
        title={
          <>
            Let&rsquo;s get your learner <span className="text-grad">started</span>
          </>
        }
        lead="Fill in the form below, or message us on WhatsApp — we'll match a tutor within a day."
      />

      <section className="pb-24">
        <div className="container-ice">
          <Reveal y={40}>
            <EnrollForm
              turnstileSiteKey={TURNSTILE_SITE_KEY}
              curricula={curricula}
              classLevels={classLevels}
              subjects={subjects}
            />
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/5 py-24">
        <div className="container-ice">
          <SectionHeading
            eyebrow="Prefer to chat first?"
            title={
              <>
                Talk to a real tutor <span className="text-grad">before you register</span>
              </>
            }
          />
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
            <Reveal>
              <FeatureCard
                icon={MessageCircle}
                title="WhatsApp us"
                body="+256 778 279 107 — fastest way to reach a tutor directly."
                href={waLinks.enrollChild}
                external
              />
            </Reveal>
            <Reveal delay={0.1}>
              <FeatureCard
                icon={Bot}
                title="Ask ICE Bot"
                body="Get quick answers on subjects, grades, and pricing first."
                href="/ice-bot"
              />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
