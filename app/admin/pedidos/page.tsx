import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import { requireAdmin } from "@/lib/admin-server";
import { listOrdersForAdmin } from "@/lib/supabase/orders";
import { formatOrderNumber, orderStatusLabels } from "@/types/order";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function AdminPedidosPage() {
  await requireAdmin("/admin/pedidos");

  const orders = await listOrdersForAdmin();

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase text-brand">Admin</p>
            <h1 className="mt-2 font-display text-4xl font-black text-neutral-950 sm:text-5xl">Pedidos</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/admin" variant="secondary">
              Produtos
            </Button>
          </div>
        </div>

        {!orders?.length ? (
          <div className="rounded-md border border-dashed border-neutral-300 p-10 text-center">
            <p className="font-bold text-neutral-700">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-neutral-100 bg-white shadow-sm">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className="grid gap-3 border-b border-neutral-100 p-4 transition last:border-b-0 hover:bg-neutral-50 lg:grid-cols-[1.1fr_1.4fr_1fr_1fr_auto_auto_auto] lg:items-center"
              >
                <div>
                  <p className="text-xs font-black uppercase text-neutral-500">Pedido</p>
                  <p className="font-bold text-neutral-950">Pedido {formatOrderNumber(order.order_number)}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-neutral-500">Cliente</p>
                  <p className="font-bold text-neutral-950">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-neutral-500">Telefone</p>
                  <p className="font-semibold text-neutral-700">{order.customer_phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-neutral-500">Cidade/Estado</p>
                  <p className="font-semibold text-neutral-700">
                    {order.city}/{order.state}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-neutral-500">Total</p>
                  <p className="font-black text-neutral-950">{formatPrice(order.total)}</p>
                </div>
                <Badge>{orderStatusLabels[order.status]}</Badge>
                <p className="text-sm font-semibold text-neutral-500">{formatDate(order.created_at)}</p>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
