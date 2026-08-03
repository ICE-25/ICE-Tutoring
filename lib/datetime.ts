/**
 * Timezone handling for lessons.
 *
 * THE BUG THIS FIXES: `new Date("2026-08-10T14:00")` — the value a
 * `datetime-local` input produces — is parsed in the *server's* zone. Locally
 * that is EAT and looks correct; on Vercel the server runs UTC, so every
 * lesson silently shifted 3 hours. Times are now converted using the zone the
 * browser actually reported, and displayed in a fixed business zone so server
 * and client always agree.
 */

/** ICE operates from Kampala; EAT has no daylight saving. */
export const BUSINESS_TIMEZONE = "Africa/Kampala";
export const BUSINESS_TIMEZONE_LABEL = "EAT";

/** Milliseconds that `timeZone` is ahead of UTC at the given instant. */
function offsetMs(at: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts: Record<string, number> = {};
  for (const part of dtf.formatToParts(at)) {
    if (part.type !== "literal") parts[part.type] = Number(part.value);
  }

  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour === 24 ? 0 : parts.hour,
    parts.minute,
    parts.second,
  );

  return asUtc - at.getTime();
}

/**
 * Converts a naive `datetime-local` string ("2026-08-10T14:00") interpreted in
 * `timeZone` into a real UTC instant.
 *
 * Returns null if the string is unparseable, so callers must handle it rather
 * than silently storing an Invalid Date.
 */
export function zonedLocalToUtc(local: string, timeZone: string): Date | null {
  if (!local) return null;

  // Pad to full ISO seconds, then read it as if it were UTC.
  const withSeconds = local.length === 16 ? `${local}:00` : local;
  const naive = new Date(`${withSeconds}Z`);
  if (Number.isNaN(naive.getTime())) return null;

  let zone = timeZone;
  try {
    // Throws RangeError on an unknown identifier.
    new Intl.DateTimeFormat("en-US", { timeZone: zone }).format(naive);
  } catch {
    zone = BUSINESS_TIMEZONE;
  }

  const first = offsetMs(naive, zone);
  let result = new Date(naive.getTime() - first);

  // One refinement pass so a time near a DST boundary lands correctly.
  const second = offsetMs(result, zone);
  if (second !== first) result = new Date(naive.getTime() - second);

  return result;
}

/**
 * Formats a stored UTC timestamp in the business timezone.
 *
 * Fixed rather than viewer-local on purpose: a server-rendered date formatted
 * in the viewer's zone would not match what the server produced, causing
 * hydration mismatches and lessons appearing at different times in different
 * places. Everyone sees the same Kampala time, labelled as such.
 */
export function formatLessonTime(
  iso: string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: BUSINESS_TIMEZONE,
    ...options,
  });
}
