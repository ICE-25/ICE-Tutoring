"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { submitTutorApplication } from "@/app/become-a-tutor/actions";
import { initialTutorApplyState } from "@/app/become-a-tutor/tutor-state";
import { Button } from "@/components/ui/Button";
import { TextField } from "./Field";
import type { ClassLevel, Curriculum, Subject } from "@/lib/database.types";
import { cn } from "@/lib/utils";

const inputClasses =
  "w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-[0.98rem] text-white " +
  "placeholder:text-slate-500 transition-all hover:border-white/25 " +
  "focus:border-cyan-brand/70 focus:outline-none focus:ring-2 focus:ring-cyan-brand/25";

function CheckChip({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "cursor-pointer select-none rounded-full border px-4 py-2 text-sm transition-all",
        checked
          ? "border-cyan-brand/70 bg-cyan-brand/20 text-cyan-glow shadow-[0_0_18px_-6px_rgba(52,199,244,0.9)]"
          : "border-white/12 bg-white/[0.03] text-slate-300 hover:border-white/30",
      )}
    >
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      {label}
    </label>
  );
}

export function TutorApplicationForm({
  curricula,
  classLevels,
  subjects,
  defaultName,
}: {
  curricula: Curriculum[];
  classLevels: ClassLevel[];
  subjects: Subject[];
  defaultName: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitTutorApplication,
    initialTutorApplyState,
  );

  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [curriculumIds, setCurriculumIds] = useState<string[]>([]);
  const [classLevelIds, setClassLevelIds] = useState<string[]>([]);

  const toggle = (
    list: string[],
    set: (v: string[]) => void,
    id: string,
    on: boolean,
  ) => set(on ? [...list, id] : list.filter((x) => x !== id));

  // Only offer class levels belonging to the curricula they selected.
  const availableLevels = useMemo(
    () => classLevels.filter((l) => curriculumIds.includes(l.curriculum_id)),
    [classLevels, curriculumIds],
  );

  if (state.status === "success") {
    return (
      <div className="edge-glow glass-strong mx-auto max-w-2xl rounded-hud-lg p-10 text-center">
        <CheckCircle2
          className="mx-auto mb-5 h-14 w-14 text-whatsapp-bright drop-shadow-[0_0_18px_rgba(52,245,140,0.6)]"
          aria-hidden
        />
        <h2 className="font-display text-2xl font-bold text-white">Application submitted</h2>
        <p aria-live="polite" className="mt-4 text-slate-300">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="edge-glow glass-strong mx-auto max-w-2xl space-y-8 rounded-hud-lg p-8 sm:p-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="full_name" label="Full name" required />
        <TextField id="phone" label="Phone number" type="tel" placeholder="07XX XXX XXX" required />
        <TextField id="headline" label="Headline" placeholder="A-Level Physics specialist" />
        <TextField
          id="years_experience"
          label="Years of tutoring experience"
          placeholder="e.g. 5"
        />
        <TextField
          id="base_location"
          label="Where are you based?"
          placeholder="e.g. Ntinda, Kampala"
          className="sm:col-span-2"
        />
      </div>

      <fieldset>
        <legend className="mb-3 font-display text-sm font-medium text-slate-200">
          Subjects you teach
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {subjects.map((s) => (
            <CheckChip
              key={s.id}
              name="subject_ids"
              value={s.id}
              label={s.name}
              checked={subjectIds.includes(s.id)}
              onChange={(on) => toggle(subjectIds, setSubjectIds, s.id, on)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-display text-sm font-medium text-slate-200">
          Curricula you know
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {curricula.map((c) => (
            <CheckChip
              key={c.id}
              name="curriculum_ids"
              value={c.id}
              label={c.name}
              checked={curriculumIds.includes(c.id)}
              onChange={(on) => {
                toggle(curriculumIds, setCurriculumIds, c.id, on);
                // Drop any class levels belonging to a curriculum just removed.
                if (!on) {
                  setClassLevelIds((prev) =>
                    prev.filter(
                      (id) =>
                        classLevels.find((l) => l.id === id)?.curriculum_id !== c.id,
                    ),
                  );
                }
              }}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-display text-sm font-medium text-slate-200">
          Classes and years you can teach
        </legend>
        {availableLevels.length === 0 ? (
          <p className="text-sm text-slate-500">Choose a curriculum first.</p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {availableLevels.map((l) => (
              <CheckChip
                key={l.id}
                name="class_level_ids"
                value={l.id}
                label={l.label}
                checked={classLevelIds.includes(l.id)}
                onChange={(on) => toggle(classLevelIds, setClassLevelIds, l.id, on)}
              />
            ))}
          </div>
        )}
      </fieldset>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="qualifications"
            className="mb-2 block font-display text-sm font-medium text-slate-200"
          >
            Qualifications
          </label>
          <textarea
            id="qualifications"
            name="qualifications"
            rows={3}
            placeholder="Degrees, teaching certificates, institutions"
            className={inputClasses}
          />
        </div>
        <div>
          <label
            htmlFor="availability_note"
            className="mb-2 block font-display text-sm font-medium text-slate-200"
          >
            Availability
          </label>
          <textarea
            id="availability_note"
            name="availability_note"
            rows={2}
            placeholder="e.g. Weekday evenings after 5pm, Saturday mornings"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="bio" className="mb-2 block font-display text-sm font-medium text-slate-200">
            About you
          </label>
          <textarea id="bio" name="bio" rows={4} className={inputClasses} />
        </div>
      </div>

      <div>
        <Button type="submit" variant="primary" size="lg" block disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Submitting…
            </>
          ) : (
            "Submit application"
          )}
        </Button>

        {state.status === "error" && (
          <p
            aria-live="polite"
            className="mt-5 flex items-center justify-center gap-2 text-center text-sm text-rose-300"
          >
            <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
