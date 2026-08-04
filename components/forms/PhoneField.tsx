"use client";

import { useState } from "react";
import { COUNTRIES, DEFAULT_COUNTRY, flagEmoji, toE164 } from "@/lib/countries";
import { cn } from "@/lib/utils";

/**
 * Phone entry with a country dial-code selector.
 *
 * Submits a single hidden field in E.164 form so the server stores one
 * canonical format, while the visible inputs stay familiar — a Ugandan parent
 * types 0778 279 107 as they always would and the leading zero is stripped.
 */
export function PhoneField({
  id,
  label = "Phone number",
  required,
  error,
  className,
  defaultCountry = DEFAULT_COUNTRY,
}: {
  id: string;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  defaultCountry?: string;
}) {
  const [iso2, setIso2] = useState(defaultCountry);
  const [local, setLocal] = useState("");

  const country = COUNTRIES.find((c) => c.iso2 === iso2) ?? COUNTRIES[0];
  const e164 = toE164(country.dial, local);

  const controlBase =
    "bg-white/[0.04] px-4 py-3.5 text-[0.98rem] text-white transition-all duration-300 " +
    "focus:bg-white/[0.07] focus:outline-none focus:ring-2";
  const tone = error
    ? "border-rose-400/60 focus:border-rose-400 focus:ring-rose-400/25"
    : "border-white/12 hover:border-white/25 focus:border-cyan-brand/70 focus:ring-cyan-brand/25";

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block font-display text-sm font-medium text-slate-200">
        {label}
      </label>

      <div className="flex gap-2">
        <label htmlFor={`${id}-country`} className="sr-only">
          Country dialling code
        </label>
        <select
          id={`${id}-country`}
          value={iso2}
          onChange={(e) => setIso2(e.target.value)}
          className={cn(
            controlBase,
            tone,
            "w-[7.5rem] shrink-0 rounded-xl border appearance-none bg-[right_0.6rem_center] bg-no-repeat pr-8",
          )}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2334C7F4' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          }}
        >
          {COUNTRIES.map((c) => (
            <option key={c.iso2} value={c.iso2}>
              {flagEmoji(c.iso2)} {c.dial}
            </option>
          ))}
        </select>

        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="0778 279 107"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(controlBase, tone, "w-full rounded-xl border")}
        />
      </div>

      {/* The canonical value the server actually reads. */}
      <input type="hidden" name={id} value={e164} readOnly />

      <p className="mt-2 text-xs text-slate-500">
        {e164 ? (
          <>
            Will be saved as <span className="text-cyan-brand">{e164}</span>
          </>
        ) : (
          <>Selected: {country.name}</>
        )}
      </p>

      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
