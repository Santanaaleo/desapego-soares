import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold uppercase text-brand">
      {children}
    </span>
  );
}
