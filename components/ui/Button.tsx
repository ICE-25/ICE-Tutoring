import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "whatsapp" | "light";

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
  className?: string;
  block?: boolean;
};

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  whatsapp: "btn-whatsapp",
  light: "btn-light",
};

function classes({ variant = "primary", size = "md", block, className }: ButtonProps) {
  return cn("btn", variants[variant], size === "lg" && "btn-lg", block && "w-full", className);
}

/** Internal or external link styled as a button. External links open in a new tab. */
export function LinkButton({
  href,
  external,
  ...props
}: ButtonProps & { href: string; external?: boolean }) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes(props)}>
        {props.children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes(props)}>
      {props.children}
    </Link>
  );
}

export function Button({
  type = "button",
  ...props
}: ButtonProps & { type?: "button" | "submit" }) {
  return (
    <button type={type} className={classes(props)}>
      {props.children}
    </button>
  );
}
