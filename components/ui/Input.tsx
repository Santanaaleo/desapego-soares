import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`focus-ring h-11 w-full rounded-md border border-neutral-200 bg-white px-4 text-sm font-normal outline-none transition placeholder:font-normal placeholder:text-neutral-400 ${className}`}
      {...props}
    />
  );
}
