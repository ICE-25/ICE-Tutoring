"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Loader2, TriangleAlert, UserPlus } from "lucide-react";
import { submitEnrollment } from "@/app/enroll/actions";
import { initialEnrollState } from "@/app/enroll/enroll-state";
import { Button, LinkButton } from "@/components/ui/Button";
import { SelectField, TextField } from "./Field";
import { CurriculumClassSelect } from "./CurriculumClassSelect";
import { TurnstileWidget } from "./TurnstileWidget";
import type { ClassLevel, Curriculum, Subject } from "@/lib/database.types";
import { cn } from "@/lib/utils";

type ReferenceProps = {
  curricula: Curriculum[];
  classLevels: ClassLevel[];
  subjects: Subject[];
};

const emptyForm = {
  parentName: "",
  learnerName: "",
  subject: "",
  phone: "",
};

/**
 * Wrapper whose only job is to hold a remount key. Bumping it gives the inner
 * form a fresh useActionState, which is how "enroll another learner" clears a
 * completed submission — a family with three children must not have to reload
 * the page between each one.
 */
export function EnrollForm({
  turnstileSiteKey,
  ...reference
}: { turnstileSiteKey: string } & ReferenceProps) {
  const [formKey, setFormKey] = useState(0);
  return (
    <EnrollFormInner
      key={formKey}
      turnstileSiteKey={turnstileSiteKey}
      {...reference}
      onEnrollAnother={() => setFormKey((k) => k + 1)}
    />
  );
}

function EnrollFormInner({
  turnstileSiteKey,
  curricula,
  classLevels,
  subjects,
  onEnrollAnother,
}: { turnstileSiteKey: string; onEnrollAnother: () => void } & ReferenceProps) {
  const [state, formAction, isPending] = useActionState(
    submitEnrollment,
    initialEnrollState,
  );

  // Controlled so a failed submission never wipes what the parent typed.
  const [values, setValues] = useState(emptyForm);
  const set = (key: keyof typeof emptyForm) => (v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const succeeded = state.status === "success";

  if (succeeded) {
    return (
      <div className="edge-glow glass-strong relative mx-auto max-w-lg rounded-hud-lg p-10 text-center shadow-card">
        <span aria-hidden className="aura -top-16 left-1/2 h-40 w-64 -translate-x-1/2 bg-whatsapp/30" />
        <div className="relative">
          <CheckCircle2
            className="mx-auto mb-5 h-14 w-14 text-whatsapp-bright drop-shadow-[0_0_18px_rgba(52,245,140,0.6)]"
            aria-hidden
          />
          <h2 className="font-display text-2xl font-bold text-white">Learner registered</h2>
          <p aria-live="polite" className="mt-4 text-slate-300">
            {state.message}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button variant="primary" onClick={onEnrollAnother}>
              <UserPlus className="h-4 w-4" aria-hidden />
              Enroll another learner
            </Button>
            <LinkButton href="/account" variant="ghost">
              View my dashboard
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="edge-glow glass-strong relative mx-auto max-w-lg rounded-hud-lg p-8 shadow-card sm:p-10"
    >
      <span aria-hidden className="aura -top-16 left-1/2 h-40 w-64 -translate-x-1/2 bg-cyan-brand/20" />

      <div className="relative">
        <span className="mb-4 inline-flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-grad-text" />
          <span className="hud-label">Register a learner</span>
        </span>
        <h2 className="mb-8 font-display text-2xl font-bold text-white">Enrollment form</h2>

        <div className="space-y-5">
          <TextField
            id="parent-name"
            label="Parent / guardian name"
            placeholder="e.g. Grace Namuli"
            autoComplete="name"
            required
            value={values.parentName}
            onChange={set("parentName")}
            error={state.fieldErrors.parentName}
          />
          <TextField
            id="learner-name"
            label="Learner's name"
            placeholder="e.g. David Namuli"
            required
            value={values.learnerName}
            onChange={set("learnerName")}
            error={state.fieldErrors.learnerName}
          />
          <CurriculumClassSelect
            curricula={curricula}
            classLevels={classLevels}
            curriculumError={state.fieldErrors.curriculum}
            classError={state.fieldErrors.classLevel}
          />
          <SelectField
            id="subject"
            label="Subject of interest"
            placeholder="Select subject"
            options={subjects.map((s) => s.name)}
            value={values.subject}
            onChange={set("subject")}
            error={state.fieldErrors.subject}
          />
          <TextField
            id="phone"
            label="Phone number"
            type="tel"
            placeholder="e.g. 07XX XXX XXX"
            autoComplete="tel"
            required
            value={values.phone}
            onChange={set("phone")}
            error={state.fieldErrors.phone}
          />
        </div>

        <TurnstileWidget siteKey={turnstileSiteKey} />

        <div className="mt-8">
          <Button type="submit" variant="primary" size="lg" block disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Registering…
              </>
            ) : (
              "Register learner"
            )}
          </Button>
        </div>

        <p
          aria-live="polite"
          className={cn(
            "mt-5 flex items-center justify-center gap-2 text-center text-sm",
            state.status === "error" ? "text-rose-300" : "text-slate-400",
          )}
        >
          {state.status === "error" && (
            <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
          )}
          {state.message}
        </p>
      </div>
    </form>
  );
}
