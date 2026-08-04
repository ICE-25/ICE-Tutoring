import { unstable_cache } from "next/cache";
import type { ClassLevel, Curriculum, Subject } from "@/lib/database.types";
import { createPublicClient } from "@/lib/supabase/public";

export type ReferenceData = {
  curricula: Curriculum[];
  classLevels: ClassLevel[];
  subjects: Subject[];
};

const EMPTY: ReferenceData = { curricula: [], classLevels: [], subjects: [] };

/**
 * Loads the enrollment dropdown data.
 *
 * Cached for an hour and fetched without cookies, so pages using it can be
 * statically rendered rather than querying the database on every request.
 * Curricula change perhaps once a year; there is no reason to pay a round
 * trip to Frankfurt for them on every page view.
 *
 * Returns empty arrays rather than throwing when Supabase is unconfigured,
 * keeping the demo fallback alive.
 */
async function loadReferenceData(): Promise<ReferenceData> {
  const supabase = createPublicClient();
  if (!supabase) return EMPTY;

  const [{ data: curricula }, { data: classLevels }, { data: subjects }] =
    await Promise.all([
      supabase
        .from("curricula")
        .select("id, code, name, country, sort_order")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("class_levels")
        .select("id, curriculum_id, code, label, stage, sort_order")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("subjects")
        .select("id, code, name, category, sort_order")
        .eq("is_active", true)
        .eq("is_bookable", true)
        .order("sort_order"),
    ]);

  return {
    curricula: curricula ?? [],
    classLevels: classLevels ?? [],
    subjects: subjects ?? [],
  };
}

export const getReferenceData = unstable_cache(
  loadReferenceData,
  ["ice-reference-data"],
  { revalidate: 3600, tags: ["reference-data"] },
);

/** "Cambridge (CIE) · Year 10" for display in lists and dashboards. */
export function describeClass(
  curriculum: Pick<Curriculum, "name"> | undefined,
  classLevel: Pick<ClassLevel, "label" | "stage"> | undefined,
): string {
  if (!curriculum && !classLevel) return "—";
  if (!classLevel) return curriculum!.name;
  const stage = classLevel.stage ? ` (${classLevel.stage})` : "";
  return curriculum ? `${curriculum.name} · ${classLevel.label}${stage}` : classLevel.label;
}
