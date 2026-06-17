import { NewProductClient } from "@/components/admin/NewProductClient";
import { requireAdmin } from "@/lib/admin-server";

export default async function NewProductPage() {
  await requireAdmin("/admin/produtos/novo");

  return <NewProductClient />;
}
