"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import { formatOrderNumber, orderStatusBadgeClasses, orderStatusLabels, type OrderListItem, type OrderStatus } from "@/types/order";

type Props = {
  initialOrders: OrderListItem[];
  selectedStatus: "all" | OrderStatus;
};

const statusFilters: { label: string; value: "all" | OrderStatus }[] = [
  { label: "Todos", value: "all" },
  { label: "Pendente", value: "pending" },
  { label: "Pago", value: "paid" },
  { label: "Enviado", value: "shipped" },
  { label: "Entregue", value: "delivered" },
  { label: "Cancelado", value: "cancelled" }
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function isSameDay(date: Date, comparison: Date) {
  return (
    date.getFullYear() === comparison.getFullYear() &&
    date.getMonth() === comparison.getMonth() &&
    date.getDate() === comparison.getDate()
  );
}

function getStats(orders: OrderListItem[]) {
  const today = new Date();
  const todayOrders = orders.filter((order) => isSameDay(new Date(order.created_at), today));
  const billableTodayOrders = todayOrders.filter((order) => ["paid", "shipped", "delivered"].includes(order.status));

  return {
    ordersToday: todayOrders.length,
    revenueToday: billableTodayOrders.reduce((sum, order) => sum + Number(order.total), 0),
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    paidOrders: orders.filter((order) => order.status === "paid").length
  };
}

function sortOrders(orders: OrderListItem[]) {
  return [...orders].sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime());
}

export function OrdersRealtimePanel({ initialOrders, selectedStatus }: Props) {
  const orders = useMemo(() => sortOrders(initialOrders), [initialOrders]);

  const filteredOrders = useMemo(
    () => (selectedStatus === "all" ? orders : orders.filter((order) => order.status === selectedStatus)),
    [orders, selectedStatus]
  );
  const stats = useMemo(() => getStats(orders), [orders]);

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

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-neutral-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Pedidos hoje</p>
            <p className="mt-2 font-display text-3xl font-black text-neutral-950">{stats.ordersToday}</p>
          </div>
          <div className="rounded-md border border-neutral-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Faturamento hoje</p>
            <p className="mt-2 font-display text-3xl font-black text-neutral-950">{formatPrice(stats.revenueToday)}</p>
          </div>
          <div className="rounded-md border border-neutral-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Pedidos pendentes</p>
            <p className="mt-2 font-display text-3xl font-black text-neutral-950">{stats.pendingOrders}</p>
          </div>
          <div className="rounded-md border border-neutral-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Pedidos pagos</p>
            <p className="mt-2 font-display text-3xl font-black text-neutral-950">{stats.paidOrders}</p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {statusFilters.map((filter) => {
            const active = selectedStatus === filter.value;
            const href = filter.value === "all" ? "/admin/pedidos" : `/admin/pedidos?status=${filter.value}`;

            return (
              <Link
                key={filter.value}
                href={href}
                className={`focus-ring rounded-full px-4 py-2 text-xs font-black uppercase transition ${
                  active ? "bg-brand text-white" : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:text-brand"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        {!filteredOrders.length ? (
          <div className="rounded-md border border-dashed border-neutral-300 p-10 text-center">
            <p className="font-bold text-neutral-700">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-neutral-100 bg-white shadow-sm">
            {filteredOrders.map((order) => (
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
                  {order.coupon_code ? <p className="text-xs font-bold text-emerald-700">Cupom {order.coupon_code}</p> : null}
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${orderStatusBadgeClasses[order.status]}`}>
                  {orderStatusLabels[order.status]}
                </span>
                <p className="text-sm font-semibold text-neutral-500">{formatDate(order.created_at)}</p>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
