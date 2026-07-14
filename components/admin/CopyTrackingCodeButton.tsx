"use client";

import { useState } from "react";

export function CopyTrackingCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copyCode}
      className="focus-ring rounded-md border border-neutral-200 px-3 py-2 text-xs font-semibold uppercase text-neutral-700 transition hover:border-brand hover:text-brand"
    >
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
}
