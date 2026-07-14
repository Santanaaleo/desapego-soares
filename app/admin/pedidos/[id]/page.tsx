import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CopyTrackingCodeButton } from "@/components/admin/CopyTrackingCodeButton";
import { OrderManagementSection } from "@/components/admin/OrderManagementSection";
import { formatPrice } from "@/lib/formatters";
import { formatCustomerDocument } from "@/lib/customer-document";
import { requireAdmin } from "@/lib/admin-server";
import { getOrderForAdmin } from "@/lib/supabase/orders";
import { formatOrderNumber, orderStatusBadgeClasses, orderStatusLabels, type OrderStatus } from "@/types/order";
import { updateOrderStatusAction, updateOrderTrackingCodeAction } from "./actions";

const statuses: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${orderStatusBadgeClasses[status]}`}>
      {orderStatusLabels[status]}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatCep(value: string) {
  const cep = value.replace(/\D/g, "");
  return cep.length === 8 ? cep.replace(/(\d{5})(\d{3})/, "$1-$2") : value;
}

export default async function AdminPedidoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await requireAdmin(`/admin/pedidos/${id}`);

  const order = await getOrderForAdmin(id);

  if (!order) {
    notFound();
  }

  const updateStatus = updateOrderStatusAction.bind(null, order.id);
  const updateTrackingCode = updateOrderTrackingCodeAction.bind(null, order.id);
  const canDelete =
    order.status === "pending" &&
    !order.order_nsu &&
    !order.transaction_nsu &&
    !order.invoice_slug &&
    !order.receipt_url &&
    !order.capture_method;

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-brand">Pedido</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-neutral-950 sm:text-4xl">
              Pedido {formatOrderNumber(order.order_number)} • {orderStatusLabels[order.status]}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">Criado em {formatDate(order.created_at)}</p>
            <p className="mt-1 text-sm text-neutral-500">Atualizado em: {formatDate(order.updated_at)}</p>
            {order.archived_at ? <p className="mt-1 text-sm font-semibold text-neutral-600">Arquivado em: {formatDate(order.archived_at)}</p> : null}
          </div>
            <div className="flex flex-wrap items-center gap-3">
              {order.archived_at ? <Badge>Arquivado</Badge> : null}
            {order.receipt_url ? (
              <a
                href={order.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold uppercase tracking-normal text-white transition hover:bg-brand-secondary"
              >
                Ver comprovante
              </a>
            ) : null}
            <Button href="/admin/pedidos" variant="secondary">
              Voltar
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <div className="rounded-md border border-neutral-100 bg-white p-5 shadow-sm">
              <h2 className="font-display text-xl font-bold uppercase text-neutral-950">Cliente</h2>
              <div className="mt-4 grid gap-3 text-sm text-neutral-700 sm:grid-cols-2">
                <p>
                  <strong>Nome:</strong> {order.customer_name}
                </p>
                <p>
                  <strong>E-mail:</strong> {order.customer_email}
                </p>
                <p>
                  <strong>Telefone:</strong> {order.customer_phone || "-"}
                </p>
                <p>
                  <strong>CPF/CNPJ:</strong> {order.customer_document ? formatCustomerDocument(order.customer_document) : "Não informado"}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-neutral-100 bg-white p-5 shadow-sm">
              <h2 className="font-display text-xl font-bold uppercase text-neutral-950">Endereço</h2>
              <div className="mt-4 grid gap-2 text-sm text-neutral-700">
                <p>
                  <strong>Logradouro:</strong> {order.address}
                </p>
                <p>
                  <strong>Número:</strong> {order.address_number}
                </p>
                <p>
                  <strong>Complemento:</strong> {order.complement || "Não informado"}
                </p>
                <p>
                  <strong>Bairro:</strong> {order.neighborhood}
                </p>
                <p>
                  <strong>Cidade/UF:</strong> {order.city}/{order.state}
                </p>
                <p>
                  <strong>CEP:</strong> {formatCep(order.zip_code)}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-neutral-100 bg-white p-5 shadow-sm">
              <h2 className="font-display text-xl font-bold uppercase text-neutral-950">Produtos</h2>
              <div className="mt-4 overflow-hidden rounded-md border border-neutral-100">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-2 border-b border-neutral-100 p-3 text-sm last:border-b-0 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center"
                  >
                    <p className="font-bold text-neutral-950">{item.product_name}</p>
                    <p className="text-neutral-600">Qtd: {item.quantity}</p>
                    <p className="text-neutral-600">Tamanho: {item.size || "-"}</p>
                    <p className="text-neutral-600">Variação: {item.variation || "-"}</p>
                    <p className="font-bold text-neutral-950">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-md border border-neutral-100 bg-neutral-50 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold uppercase text-neutral-950">Resumo</h2>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mt-5 grid gap-3 text-sm text-neutral-700">
              <div className="flex justify-between gap-4">
                <span>Subtotal</span>
                <strong>{formatPrice(order.subtotal)}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Frete</span>
                <strong>{formatPrice(order.shipping)}</strong>
              </div>
              {order.coupon_code ? (
                <div className="flex justify-between gap-4 text-emerald-700">
                  <span>Cupom {order.coupon_code}</span>
                  <strong>-{formatPrice(order.discount_amount)}</strong>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 border-t border-neutral-200 pt-3 text-base">
                <span className="font-semibold uppercase">Total</span>
                <strong className="font-bold text-brand">{formatPrice(order.total)}</strong>
              </div>
            </div>

            <form action={updateStatus} className="mt-6 grid gap-3 border-t border-neutral-200 pt-5">
              <label className="text-xs font-semibold uppercase text-neutral-500" htmlFor="status">
                Alterar situação
              </label>
              <select
                id="status"
                name="status"
                defaultValue={order.status}
                className="focus-ring h-11 rounded-md border border-neutral-200 bg-white px-3 text-sm font-normal"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {orderStatusLabels[status]}
                  </option>
                ))}
              </select>
              <Button type="submit">Salvar situação</Button>
            </form>

            <form action={updateTrackingCode} className="mt-6 grid gap-3 border-t border-neutral-200 pt-5">
              <label className="text-xs font-semibold uppercase text-neutral-500" htmlFor="tracking_code">
                Código de Rastreio
              </label>
              <input
                id="tracking_code"
                name="tracking_code"
                defaultValue={order.tracking_code || ""}
                placeholder="Informe o código"
                className="focus-ring h-11 rounded-md border border-neutral-200 bg-white px-3 text-sm font-normal"
              />
              {order.tracking_code ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-white p-3 text-sm font-semibold text-neutral-700">
                  <span>{order.tracking_code}</span>
                  <CopyTrackingCodeButton code={order.tracking_code} />
                </div>
              ) : null}
              <Button type="submit">Salvar rastreio</Button>
            </form>

            <OrderManagementSection
              orderId={order.id}
              orderNumber={order.order_number}
              canDelete={canDelete}
              archived={Boolean(order.archived_at)}
            />
          </aside>
        </div>

        <Link href="/admin/pedidos" className="mt-6 inline-block text-sm font-semibold text-brand hover:text-brand-secondary">
          Voltar para pedidos
        </Link>
      </Container>
    </section>
  );
}
