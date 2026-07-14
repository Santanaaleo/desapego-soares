import { OrdersRealtimePanel } from "@/components/admin/OrdersRealtimePanel";
import { requireAdmin } from "@/lib/admin-server";
import { listOrdersForAdmin } from "@/lib/supabase/orders";
import type { OrderStatus } from "@/types/order";

type Props = {
  searchParams?: Promise<{
    status?: string;
    excluido?: string;
    view?: string;
    resultado?: string;
  }>;
};

const statusValues: ("all" | OrderStatus)[] = ["all", "pending", "paid", "shipped", "delivered", "cancelled"];

export default async function AdminPedidosPage({ searchParams }: Props) {
  await requireAdmin("/admin/pedidos");

  const params = await searchParams;
  const selectedStatus = statusValues.includes(params?.status as "all" | OrderStatus) ? (params?.status as "all" | OrderStatus) : "all";
  const selectedView = params?.view === "archived" ? "archived" : "active";
  const activeOrders = (await listOrdersForAdmin(false)) ?? [];
  const orders = selectedView === "archived" ? (await listOrdersForAdmin(true)) ?? [] : activeOrders;
  const feedback =
    params?.resultado === "arquivado"
      ? "Pedido arquivado. Os indicadores foram atualizados."
      : params?.resultado === "restaurado"
        ? "Pedido restaurado. Os indicadores foram atualizados."
        : params?.resultado === "excluido" || params?.excluido === "1"
          ? "Pedido excluído permanentemente. Os indicadores foram atualizados."
          : undefined;

  return (
    <OrdersRealtimePanel
      initialOrders={orders}
      statsOrders={activeOrders}
      selectedStatus={selectedStatus}
      selectedView={selectedView}
      feedback={feedback}
    />
  );
}
