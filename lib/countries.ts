/**
 * Dialling codes for the phone input.
 *
 * Ordered by relevance to ICE: Uganda first, then the wider East African
 * region, then destinations where Ugandan families commonly live abroad.
 */

export type Country = { iso2: string; name: string; dial: string };

export const COUNTRIES: Country[] = [
  { iso2: "UG", name: "Uganda", dial: "+256" },
  { iso2: "KE", name: "Kenya", dial: "+254" },
  { iso2: "TZ", name: "Tanzania", dial: "+255" },
  { iso2: "RW", name: "Rwanda", dial: "+250" },
  { iso2: "BI", name: "Burundi", dial: "+257" },
  { iso2: "SS", name: "South Sudan", dial: "+211" },
  { iso2: "ET", name: "Ethiopia", dial: "+251" },
  { iso2: "SO", name: "Somalia", dial: "+252" },
  { iso2: "CD", name: "DR Congo", dial: "+243" },
  { iso2: "NG", name: "Nigeria", dial: "+234" },
  { iso2: "GH", name: "Ghana", dial: "+233" },
  { iso2: "ZA", name: "South Africa", dial: "+27" },
  { iso2: "EG", name: "Egypt", dial: "+20" },
  { iso2: "GB", name: "United Kingdom", dial: "+44" },
  { iso2: "IE", name: "Ireland", dial: "+353" },
  { iso2: "US", name: "United States", dial: "+1" },
  { iso2: "CA", name: "Canada", dial: "+1" },
  { iso2: "AE", name: "United Arab Emirates", dial: "+971" },
  { iso2: "QA", name: "Qatar", dial: "+974" },
  { iso2: "SA", name: "Saudi Arabia", dial: "+966" },
  { iso2: "IN", name: "India", dial: "+91" },
  { iso2: "CN", name: "China", dial: "+86" },
  { iso2: "DE", name: "Germany", dial: "+49" },
  { iso2: "FR", name: "France", dial: "+33" },
  { iso2: "NL", name: "Netherlands", dial: "+31" },
  { iso2: "BE", name: "Belgium", dial: "+32" },
  { iso2: "SE", name: "Sweden", dial: "+46" },
  { iso2: "NO", name: "Norway", dial: "+47" },
  { iso2: "DK", name: "Denmark", dial: "+45" },
  { iso2: "IT", name: "Italy", dial: "+39" },
  { iso2: "ES", name: "Spain", dial: "+34" },
  { iso2: "AU", name: "Australia", dial: "+61" },
  { iso2: "NZ", name: "New Zealand", dial: "+64" },
];

export const DEFAULT_COUNTRY = "UG";

/**
 * Flag emoji derived from the ISO-3166 alpha-2 code by mapping each letter to
 * its regional indicator symbol. Computed rather than stored, so there is no
 * image to load and no list to keep in sync.
 */
export function flagEmoji(iso2: string): string {
  return String.fromCodePoint(
    ...iso2
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0)),
  );
}

/**
 * Combines a dialling code and a locally-typed number into E.164
 * ("+256778279107"). Ugandans habitually write a leading 0 — "0778 279 107" —
 * which must be dropped, or the number becomes +2560778279107 and undialable.
 */
export function toE164(dial: string, localNumber: string): string {
  const digits = localNumber.replace(/\D/g, "").replace(/^0+/, "");
  return digits ? `${dial}${digits}` : "";
}
