"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "./Field";

const DEMO_NOTE = "This is a demo form — connect it to your backend to go live.";
const DEFAULT_NOTE = "We'll confirm your enrollment on WhatsApp within one business day.";

const grades = [
  "Primary (P.1 – P.7)",
  "Middle School (S.1 – S.4)",
  "Upper Secondary (S.5 – S.6)",
] as const;

const subjects = [
  "Mathematics",
  "Science",
  "English",
  "French",
  "Physics",
  "Chemistry",
  "Biology",
  "Coding",
  "Robotics",
] as const;

export function EnrollForm() {
  const [note, setNote] = useState(DEFAULT_NOTE);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setNote(DEMO_NOTE);
      }}
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
          />
          <TextField
            id="learner-name"
            label="Learner's name"
            placeholder="e.g. David Namuli"
            required
          />
          <SelectField id="grade" label="Grade level" placeholder="Select grade" options={grades} required />
          <SelectField
            id="subject"
            label="Subject of interest"
            placeholder="Select subject"
            options={subjects}
          />
          <TextField
            id="phone"
            label="Phone number"
            type="tel"
            placeholder="e.g. 07XX XXX XXX"
            autoComplete="tel"
            required
          />
        </div>

        <div className="mt-8">
          <Button type="submit" variant="primary" size="lg" block>
            Register learner
          </Button>
        </div>

        <p aria-live="polite" className="mt-5 text-center text-sm text-slate-400">
          {note}
        </p>
      </div>
    </form>
  );
}
