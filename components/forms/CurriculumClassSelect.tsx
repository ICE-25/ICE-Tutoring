"use client";

import { useMemo, useState } from "react";
import type { ClassLevel, Curriculum } from "@/lib/database.types";
import { SelectField } from "./Field";

/**
 * Curriculum first, then the class list narrows to that curriculum's real
 * labels — P.1–S.6 for UNEB, Year 1–13 for Cambridge, and so on.
 *
 * Both ids are submitted, so reporting can slice by curriculum or by class
 * without parsing a display string.
 */
export function CurriculumClassSelect({
  curricula,
  classLevels,
  curriculumError,
  classError,
}: {
  curricula: Curriculum[];
  classLevels: ClassLevel[];
  curriculumError?: string;
  classError?: string;
}) {
  const [curriculumId, setCurriculumId] = useState("");
  const [classLevelId, setClassLevelId] = useState("");

  // Group by stage so a 13-item list reads as three short ones.
  const grouped = useMemo(() => {
    const forCurriculum = classLevels.filter((c) => c.curriculum_id === curriculumId);
    const stages = new Map<string, ClassLevel[]>();
    for (const level of forCurriculum) {
      const list = stages.get(level.stage) ?? [];
      list.push(level);
      stages.set(level.stage, list);
    }
    return stages;
  }, [classLevels, curriculumId]);

  return (
    <>
      <SelectField
        id="curriculum_id"
        label="Curriculum"
        placeholder="Select curriculum"
        required
        error={curriculumError}
        value={curriculumId}
        onChange={(v) => {
          setCurriculumId(v);
          setClassLevelId(""); // a class from the old curriculum is meaningless
        }}
        options={curricula.map((c) => ({ value: c.id, label: c.name }))}
      />

      <div>
        <label
          htmlFor="class_level_id"
          className="mb-2 block font-display text-sm font-medium text-slate-200"
        >
          Class / year
        </label>
        <select
          id="class_level_id"
          name="class_level_id"
          required
          disabled={!curriculumId}
          value={classLevelId}
          onChange={(e) => setClassLevelId(e.target.value)}
          aria-invalid={classError ? true : undefined}
          aria-describedby={classError ? "class_level_id-error" : undefined}
          className={[
            "w-full rounded-xl border bg-white/[0.04] px-4 py-3.5 text-[0.98rem] text-white",
            "transition-all duration-300 focus:bg-white/[0.07] focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "appearance-none bg-[right_1rem_center] bg-no-repeat pr-11",
            classError
              ? "border-rose-400/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/25"
              : "border-white/12 hover:border-white/25 focus:border-cyan-brand/70 focus:ring-2 focus:ring-cyan-brand/25",
          ].join(" ")}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2334C7F4' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          }}
        >
          <option value="">
            {curriculumId ? "Select class or year" : "Choose a curriculum first"}
          </option>
          {[...grouped.entries()].map(([stage, levels]) => (
            <optgroup key={stage} label={stage}>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {classError && (
          <p id="class_level_id-error" className="mt-2 text-sm text-rose-300">
            {classError}
          </p>
        )}
      </div>
    </>
  );
}
