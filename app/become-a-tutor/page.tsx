import type { Metadata } from "next";
import { Clock, ShieldCheck, TriangleAlert } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { TutorApplicationForm } from "@/components/forms/TutorApplicationForm";
import { LinkButton } from "@/components/ui/Button";
import { getReferenceData } from "@/lib/curriculum";
import { createClient } from "@/lib/supabase/server";
import type { TutorStatus } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Become a Tutor",
  description:
    "Apply to teach with ICE Tutoring — tell us your subjects, curricula and availability.",
};

export const dynamic = "force-dynamic";

const statusCopy: Record<TutorStatus, { title: string; body: string; tone: string }> = {
  draft: {
    title: "Application started",
    body: "You began an application but haven't submitted it yet.",
    tone: "border-white/15 bg-white/5 text-slate-300",
  },
  submitted: {
    title: "Application under review",
    body: "Our team reviews applications within two business days. We'll contact you on the number you provided.",
    tone: "border-cyan-brand/40 bg-cyan-brand/10 text-cyan-glow",
  },
  approved: {
    title: "You're an approved ICE tutor",
    body: "Your profile is live and you can be matched to learners.",
    tone: "border-whatsapp-bright/40 bg-whatsapp/10 text-whatsapp-bright",
  },
  rejected: {
    title: "Application not successful",
    body: "We weren't able to approve this application. Message us on WhatsApp if you'd like feedback.",
    tone: "border-rose-400/40 bg-rose-400/10 text-rose-300",
  },
  suspended: {
    title: "Profile suspended",
    body: "Your tutor profile is currently suspended. Please contact the ICE team.",
    tone: "border-gold/40 bg-gold/10 text-gold",
  },
};

export default async function BecomeATutorPage() {
  const supabase = await createClient();
  const { curricula, classLevels, subjects } = await getReferenceData();

  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  const { data: existing } = user
    ? await supabase!
        .from("tutors")
        .select("status, full_name")
        .eq("profile_id", user.id)
        .maybeSingle()
    : { data: null };

  const { data: profile } = user
    ? await supabase!.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <>
      <PageHero
        tag="Teach with ICE"
        title={
          <>
            Join the team <span className="text-grad">remoulding students</span>
          </>
        }
        lead="Tell us what you teach, which curricula you know, and when you're available. Every application is reviewed by a person."
      />

      <section className="pb-24">
        <div className="container-ice">
          {/* Not signed in ------------------------------------------------ */}
          {!user && (
            <div className="edge-glow glass mx-auto max-w-2xl rounded-hud p-10 text-center">
              <ShieldCheck className="mx-auto mb-5 h-12 w-12 text-cyan-brand" aria-hidden />
              <h2 className="font-display text-2xl font-bold text-white">
                Create an account first
              </h2>
              <p className="mx-auto mt-4 max-w-md text-slate-400">
                Applying needs an account so you can track your application status and, once
                approved, manage your lessons.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <LinkButton href="/account" variant="primary">
                  Register or log in
                </LinkButton>
              </div>
            </div>
          )}

          {/* Already applied ---------------------------------------------- */}
          {user && existing && existing.status !== "draft" && (
            <div className="mx-auto max-w-2xl">
              <div
                className={`edge-glow glass rounded-hud border p-8 text-center ${statusCopy[existing.status].tone}`}
              >
                <Clock className="mx-auto mb-4 h-10 w-10" aria-hidden />
                <h2 className="font-display text-xl font-bold text-white">
                  {statusCopy[existing.status].title}
                </h2>
                <p className="mt-3 text-slate-300">{statusCopy[existing.status].body}</p>
              </div>
            </div>
          )}

          {/* Apply --------------------------------------------------------- */}
          {user && (!existing || existing.status === "draft") && (
            <>
              {subjects.length === 0 && (
                <p className="mx-auto mb-6 flex max-w-2xl items-center gap-2 rounded-hud border border-gold/30 bg-gold/10 p-4 text-sm text-gold">
                  <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
                  Reference data hasn&rsquo;t loaded — the curriculum migration may not be
                  applied yet.
                </p>
              )}
              <TutorApplicationForm
                curricula={curricula}
                classLevels={classLevels}
                subjects={subjects}
                defaultName={profile?.full_name ?? ""}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
