import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { requireAdmin } from "@/lib/admin-server";

export default async function AdminPage() {
  await requireAdmin("/admin");

  return <AdminDashboard />;
}
