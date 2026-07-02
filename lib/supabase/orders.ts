import { supabaseAdmin } from "./server";
import type { Order, OrderStatus, OrderWithItems } from "@/types/order";

const ordersTable = "orders";
const allowedStatuses: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && allowedStatuses.includes(value as OrderStatus);
}

export async function listOrdersForAdmin() {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin.from(ordersTable).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export async function getOrderForAdmin(id: string) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from(ordersTable)
    .select("*, order_items(*)")
    .eq("id", id)
    .order("created_at", { referencedTable: "order_items", ascending: true })
    .maybeSingle();
  if (error) throw error;
  return data as OrderWithItems | null;
}

export async function getOrderByOrderNsu(orderNsu: string) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin.from(ordersTable).select("*").eq("order_nsu", orderNsu).maybeSingle();
  if (error) throw error;
  return data as Order | null;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from(ordersTable)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Order;
}

export async function updateOrderTrackingCode(id: string, trackingCode: string | null) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from(ordersTable)
    .update({ tracking_code: trackingCode, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Order;
}

export async function markOrderPaidByOrderNsu(input: {
  orderNsu: string;
  transactionNsu?: string | null;
  invoiceSlug?: string | null;
  receiptUrl?: string | null;
  captureMethod?: string | null;
}) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from(ordersTable)
    .update({
      status: "paid",
      transaction_nsu: input.transactionNsu || null,
      invoice_slug: input.invoiceSlug || null,
      receipt_url: input.receiptUrl || null,
      capture_method: input.captureMethod || null,
      updated_at: new Date().toISOString()
    })
    .eq("order_nsu", input.orderNsu)
    .select("id,order_nsu,status,coupon_code")
    .maybeSingle();
  if (error) throw error;
  return data as Pick<Order, "id" | "order_nsu" | "status" | "coupon_code"> | null;
}
