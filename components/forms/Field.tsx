"use client";

import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-xl border bg-white/[0.04] px-4 py-3.5 text-[0.98rem] text-white " +
  "placeholder:text-slate-500 transition-all duration-300 " +
  "focus:bg-white/[0.07] focus:outline-none";

const controlOk =
  "border-white/12 hover:border-white/25 focus:border-cyan-brand/70 focus:ring-2 focus:ring-cyan-brand/25";

const controlError =
  "border-rose-400/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/25";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="mt-2 text-sm text-rose-300">
      {message}
    </p>
  );
}

type BaseProps = {
  id: string;
  label: string;
  className?: string;
  error?: string;
};

export function TextField({
  id,
  label,
  type = "text",
  placeholder,
  required,
  autoComplete,
  className,
  error,
  value,
  onChange,
}: BaseProps & {
  type?: "text" | "tel" | "email" | "password";
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block font-display text-sm font-medium text-slate-200">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...(onChange ? { value: value ?? "", onChange: (e) => onChange(e.target.value) } : {})}
        className={cn(controlBase, error ? controlError : controlOk)}
      />
      <FieldError id={id} message={error} />
    </div>
  );
}

export function SelectField({
  id,
  label,
  options,
  placeholder,
  required,
  className,
  error,
  value,
  onChange,
}: BaseProps & {
  /** Plain strings submit their own text; objects submit `value` and show `label`. */
  options: readonly (string | { value: string; label: string })[];
  placeholder: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block font-display text-sm font-medium text-slate-200">
        {label}
      </label>
      <select
        id={id}
        name={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...(onChange
          ? { value: value ?? "", onChange: (e) => onChange(e.target.value) }
          : { defaultValue: "" })}
        className={cn(
          controlBase,
          error ? controlError : controlOk,
          "appearance-none bg-[right_1rem_center] bg-no-repeat pr-11",
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2334C7F4' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
      >
        <option value="" className="bg-abyss">
          {placeholder}
        </option>
        {options.map((opt, index) => {
          // Coerce and index-suffix the key. React requires a string; anything
          // else stringifies to "[object Object]" and every row collides.
          // The index also keeps keys unique when two options share a value,
          // which happens with real data (two learners named John Mukasa).
          const raw = typeof opt === "string" ? opt : opt?.value;
          const label = typeof opt === "string" ? opt : opt?.label;
          const value = typeof raw === "string" ? raw : String(raw ?? "");
          return (
            <option key={`${value}-${index}`} value={value} className="bg-abyss">
              {label}
            </option>
          );
        })}
      </select>
      <FieldError id={id} message={error} />
    </div>
  );
}
