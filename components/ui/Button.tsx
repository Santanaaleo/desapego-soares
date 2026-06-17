import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
};

const variants = {
  primary: "bg-brand text-white hover:bg-brand-secondary",
  secondary: "border border-neutral-300 text-neutral-950 hover:border-brand hover:bg-brand hover:text-white",
  ghost: "text-brand hover:bg-brand-mist"
};

export function Button({ href, variant = "primary", className = "", children, ...props }: ButtonProps) {
  const classes = `focus-ring inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-bold uppercase tracking-normal transition ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
