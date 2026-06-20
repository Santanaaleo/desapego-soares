export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado"
};

export const orderStatusBadgeClasses: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  shipped: "bg-sky-100 text-sky-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700"
};

export function formatOrderNumber(orderNumber: number | null | undefined) {
  return orderNumber ? `#${orderNumber.toString().padStart(6, "0")}` : "#------";
}

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  size: string | null;
  unit_price: number;
  subtotal: number;
  created_at: string;
};

export type Order = {
  id: string;
  order_number: number;
  order_nsu: string | null;
  transaction_nsu: string | null;
  invoice_slug: string | null;
  receipt_url: string | null;
  capture_method: string | null;
  tracking_code: string | null;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  zip_code: string;
  address: string;
  address_number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  subtotal: number;
  shipping: number;
  total: number;
  created_at: string;
  updated_at: string;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};
