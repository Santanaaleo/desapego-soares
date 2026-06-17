import { EditProductClient } from "@/components/admin/EditProductClient";
import { requireAdmin } from "@/lib/admin-server";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await requireAdmin(`/admin/produtos/${id}/editar`);

  return <EditProductClient id={id} />;
}
