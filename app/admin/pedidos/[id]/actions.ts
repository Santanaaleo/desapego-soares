"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-server";
import { isOrderStatus, updateOrderStatus, updateOrderTrackingCode } from "@/lib/supabase/orders";

export async function updateOrderStatusAction(id: string, formData: FormData) {
  await requireAdmin(`/admin/pedidos/${id}`);

  const status = formData.get("status");

  if (!isOrderStatus(status)) {
    throw new Error("Status inválido.");
  }

  await updateOrderStatus(id, status);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  redirect(`/admin/pedidos/${id}`);
}

export async function updateOrderTrackingCodeAction(id: string, formData: FormData) {
  await requireAdmin(`/admin/pedidos/${id}`);

  const trackingCode = formData.get("tracking_code");
  const normalized = typeof trackingCode === "string" ? trackingCode.trim() : "";

  await updateOrderTrackingCode(id, normalized || null);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  redirect(`/admin/pedidos/${id}`);
}
