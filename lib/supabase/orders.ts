import { supabaseAdmin } from "./server";
import type { Order, OrderListItem, OrderStatus, OrderWithItems } from "@/types/order";

const ordersTable = "orders";
const allowedStatuses: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && allowedStatuses.includes(value as OrderStatus);
}

export async function listOrdersForAdmin(archived = false) {
  if (!supabaseAdmin) return null;

  let query = supabaseAdmin
    .from(ordersTable)
    .select("id,order_number,status,customer_name,customer_phone,city,state,total,coupon_code,archived_at,created_at")
    .order("created_at", { ascending: false });

  query = archived ? query.not("archived_at", "is", null) : query.is("archived_at", null);

  const { data, error } = await query;
  if (error) throw error;
  return data as OrderListItem[];
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

export async function getOrderWithItemsByOrderNsu(orderNsu: string) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from(ordersTable)
    .select("*, order_items(*)")
    .eq("order_nsu", orderNsu)
    .order("created_at", { referencedTable: "order_items", ascending: true })
    .maybeSingle();
  if (error) throw error;
  return data as OrderWithItems | null;
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

export type DeleteOrderResult = "deleted" | "not_found" | "blocked_status" | "blocked_payment" | "blocked_archived";

export async function deleteOrderForAdmin(id: string) {
  if (!supabaseAdmin) return null;

  const { data: order, error: orderError } = await supabaseAdmin
    .from(ordersTable)
    .select("status,order_nsu,transaction_nsu,invoice_slug,receipt_url,capture_method,archived_at")
    .eq("id", id)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order) return "not_found";
  if (order.archived_at) return "blocked_archived";
  if (order.status !== "pending") return "blocked_status";
  if (order.order_nsu || order.transaction_nsu || order.invoice_slug || order.receipt_url || order.capture_method) return "blocked_payment";

  const { data, error } = await supabaseAdmin.rpc("delete_order_for_admin", {
    input_order_id: id
  });
  if (error) throw error;

  return ((data as { result: DeleteOrderResult }[] | null) ?? [])[0]?.result ?? "not_found";
}

export type ArchiveOrderResult = "archived" | "restored" | "already_archived" | "already_active" | "not_found";

export async function setOrderArchivedForAdmin(id: string, archived: boolean) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin.rpc("set_order_archived_for_admin", {
    input_order_id: id,
    input_archived: archived
  });
  if (error) throw error;

  return ((data as { result: ArchiveOrderResult }[] | null) ?? [])[0]?.result ?? "not_found";
}

export async function markOrderPaidByOrderNsu(input: {
  orderNsu: string;
  transactionNsu?: string | null;
  invoiceSlug?: string | null;
  receiptUrl?: string | null;
  captureMethod?: string | null;
}) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin.rpc("confirm_order_paid_with_stock", {
    input_order_nsu: input.orderNsu,
    input_transaction_nsu: input.transactionNsu || null,
    input_invoice_slug: input.invoiceSlug || null,
    input_receipt_url: input.receiptUrl || null,
    input_capture_method: input.captureMethod || null
  });
  if (error) throw error;
  return ((data as Pick<Order, "id" | "order_nsu" | "status" | "coupon_code">[] | null) ?? [])[0] ?? null;
}
