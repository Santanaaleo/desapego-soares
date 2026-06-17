"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md border-2 border-neutral-950 px-4 text-sm font-black uppercase transition hover:border-brand hover:text-brand"
    >
      <LogOut size={18} />
      Sair
    </button>
  );
}
