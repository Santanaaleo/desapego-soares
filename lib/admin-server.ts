import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminCookieName, verifyAdminToken } from "@/lib/admin-auth";

export async function requireAdmin(nextPath: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const isAuthenticated = await verifyAdminToken(token, process.env.ADMIN_PASSWORD);

  if (!isAuthenticated) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }
}
