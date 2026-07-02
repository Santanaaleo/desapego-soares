import { NextResponse } from "next/server";
import { incrementCouponUsage } from "@/lib/supabase/coupons";
import { getOrderWithItemsByOrderNsu, markOrderPaidByOrderNsu } from "@/lib/supabase/orders";

type InfinitePayWebhookPayload = {
  invoice_slug?: string;
  amount?: number;
  paid_amount?: number;
  installments?: number;
  capture_method?: string;
  transaction_nsu?: string;
  order_nsu?: string;
  receipt_url?: string;
  items?: unknown[];
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cents(value: number) {
  return Math.round(value * 100);
}

function getPaidAmountInCents(value: unknown) {
  if (!Number.isFinite(Number(value))) return null;

  const amount = Number(value);
  return Number.isInteger(amount) && amount >= 1000 ? amount : cents(amount);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.INFINITEPAY_WEBHOOK_SECRET?.trim();
  const requestSecret = request.headers.get("x-infinitepay-webhook-secret")?.trim();

  if (!webhookSecret || requestSecret !== webhookSecret) {
    console.error("[infinitepay:webhook] Webhook não autorizado.");
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  let payload: InfinitePayWebhookPayload;

  try {
    payload = (await request.json()) as InfinitePayWebhookPayload;
  } catch {
    console.error("[infinitepay:webhook] Payload inválido.");
    return NextResponse.json({ ok: false, error: "Payload inválido." }, { status: 400 });
  }

  const orderNsu = clean(payload.order_nsu);

  console.info("[infinitepay:webhook] Evento recebido:", {
    order_nsu: orderNsu || null,
    invoice_slug: clean(payload.invoice_slug) || null,
    transaction_nsu: clean(payload.transaction_nsu) || null,
    capture_method: clean(payload.capture_method) || null,
    has_receipt_url: Boolean(clean(payload.receipt_url)),
    amount: payload.amount,
    paid_amount: payload.paid_amount,
    installments: payload.installments,
    items_count: Array.isArray(payload.items) ? payload.items.length : null
  });

  if (!orderNsu) {
    console.error("[infinitepay:webhook] order_nsu ausente.");
    return NextResponse.json({ ok: false, error: "order_nsu ausente." }, { status: 400 });
  }

  try {
    const existingOrder = await getOrderWithItemsByOrderNsu(orderNsu);

    if (!existingOrder) {
      console.error("[infinitepay:webhook] Pedido não encontrado:", { order_nsu: orderNsu });
      return NextResponse.json({ ok: false, error: "Pedido não encontrado." }, { status: 404 });
    }

    const paidAmountInCents = getPaidAmountInCents(payload.paid_amount ?? payload.amount);
    const expectedAmountInCents = cents(Number(existingOrder.total));

    if (!paidAmountInCents || paidAmountInCents < expectedAmountInCents) {
      console.error("[infinitepay:webhook] Valor pago inválido:", {
        order_nsu: orderNsu,
        expected_amount: expectedAmountInCents,
        paid_amount: paidAmountInCents
      });
      return NextResponse.json({ ok: false, error: "Valor pago inválido." }, { status: 400 });
    }

    const wasAlreadyPaid = existingOrder.status === "paid";
    const order = await markOrderPaidByOrderNsu({
      orderNsu,
      transactionNsu: clean(payload.transaction_nsu),
      invoiceSlug: clean(payload.invoice_slug),
      receiptUrl: clean(payload.receipt_url),
      captureMethod: clean(payload.capture_method)
    });

    if (!order) {
      if (wasAlreadyPaid) {
        console.info("[infinitepay:webhook] Pedido já estava pago:", { order_nsu: orderNsu });
        return NextResponse.json({ ok: true });
      }

      console.error("[infinitepay:webhook] Pedido não atualizado:", { order_nsu: orderNsu });
      return NextResponse.json({ ok: false, error: "Pedido não atualizado." }, { status: 500 });
    }

    if (!wasAlreadyPaid && existingOrder.coupon_code) {
      await incrementCouponUsage(existingOrder.coupon_code);
    }

    console.info("[infinitepay:webhook] Pedido atualizado:", { id: order.id, order_nsu: order.order_nsu, status: order.status });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[infinitepay:webhook] Falha ao atualizar pedido:", error);
    return NextResponse.json({ ok: false, error: "Falha ao atualizar pedido." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "infinitepay webhook" });
}
