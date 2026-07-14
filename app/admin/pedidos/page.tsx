import { OrdersRealtimePanel } from "@/components/admin/OrdersRealtimePanel";
import { requireAdmin } from "@/lib/admin-server";
import { listOrdersForAdmin } from "@/lib/supabase/orders";
import type { OrderStatus } from "@/types/order";

type Props = {
  searchParams?: Promise<{
    status?: string;
    excluido?: string;
  }>;
};

const statusValues: ("all" | OrderStatus)[] = ["all", "pending", "paid", "shipped", "delivered", "cancelled"];

export default async function AdminPedidosPage({ searchParams }: Props) {
  await requireAdmin("/admin/pedidos");

  const params = await searchParams;
  const selectedStatus = statusValues.includes(params?.status as "all" | OrderStatus) ? (params?.status as "all" | OrderStatus) : "all";
  const orders = await listOrdersForAdmin();

  return <OrdersRealtimePanel initialOrders={orders ?? []} selectedStatus={selectedStatus} deletionSucceeded={params?.excluido === "1"} />;
}
