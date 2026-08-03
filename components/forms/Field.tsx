import { cn } from "@/lib/utils";

const controlClasses =
  "w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-[0.98rem] text-white " +
  "placeholder:text-slate-500 transition-all duration-300 " +
  "hover:border-white/25 focus:border-cyan-brand/70 focus:bg-white/[0.07] focus:outline-none " +
  "focus:ring-2 focus:ring-cyan-brand/25";

type BaseProps = {
  id: string;
  label: string;
  className?: string;
};

export function TextField({
  id,
  label,
  type = "text",
  placeholder,
  required,
  autoComplete,
  className,
}: BaseProps & {
  type?: "text" | "tel" | "email" | "password";
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
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
        className={controlClasses}
      />
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
}: BaseProps & {
  options: readonly string[];
  placeholder: string;
  required?: boolean;
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
        defaultValue=""
        className={cn(controlClasses, "appearance-none bg-[right_1rem_center] bg-no-repeat pr-11")}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2334C7F4' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
      >
        <option value="" className="bg-abyss">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-abyss">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
