"use client";

import { Truck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCoupon } from "@/hooks/useCoupon";
import { formatPrice } from "@/lib/formatters";
import { calculateInstallments } from "@/lib/installments";
import { getProductSale } from "@/lib/product-pricing";
import type { CartItem } from "@/types/cart";

export function CartSummary({ items, total }: { items: CartItem[]; total: number }) {
  const [showInstallments, setShowInstallments] = useState(false);
  const { coupon, code, setCode, loading, error, applyCoupon, removeCoupon } = useCoupon(total);
  const disabled = items.length === 0;
  const discountAmount = coupon?.discountAmount ?? 0;
  const discountedTotal = Math.max(0, total - discountAmount);
  const installments = calculateInstallments(discountedTotal);
  const bestInstallment = installments[installments.length - 1];

  return (
    <aside className="self-start rounded-md border border-neutral-200 bg-neutral-50 p-5">
      <h2 className="text-xl font-bold uppercase text-neutral-950">Resumo da sacola</h2>
      <div className="mt-4 grid gap-2 text-sm text-neutral-700">
        {items.map((item) => {
          const sale = getProductSale(item.product);

          return (
            <div key={`${item.product.id}-${item.size}-${item.variation}`} className="flex justify-between gap-3">
              <span>
                {item.quantity}x {item.product.name}
                {item.size ? ` · ${item.size}` : ""}
                {item.variation ? ` · ${item.variation}` : ""}
                {sale ? <span className="ml-1 text-[10px] font-semibold uppercase text-brand">{sale.percentOff}% OFF</span> : null}
              </span>
              <strong>{formatPrice(item.product.price * item.quantity)}</strong>
            </div>
          );
        })}
      </div>
      <div className="mt-5 grid gap-3 border-t border-neutral-200 pt-5">
        <div className="flex items-center justify-between">
          <span className="font-semibold uppercase text-neutral-700">Subtotal</span>
          <span className="font-semibold text-neutral-950">{formatPrice(total)}</span>
        </div>
        {coupon ? (
          <div className="flex items-center justify-between text-emerald-700">
            <span className="font-semibold uppercase">Desconto</span>
            <span className="font-semibold">-{formatPrice(discountAmount)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
          <span className="font-semibold uppercase text-neutral-700">Total produtos</span>
          <span className="text-2xl font-bold text-brand">{formatPrice(discountedTotal)}</span>
        </div>
      </div>

      <div className="mt-5 rounded-md border border-neutral-200 bg-white p-3">
        <label className="text-xs font-semibold uppercase text-neutral-500" htmlFor="cart-coupon">
          Cupom de desconto
        </label>
        {coupon ? (
          <div className="mt-3 rounded-md bg-emerald-50 p-3 text-sm font-normal text-emerald-800">
            <p>Cupom {coupon.code} aplicado</p>
            <p>Desconto: -{formatPrice(discountAmount)}</p>
            <button type="button" onClick={removeCoupon} className="mt-2 text-xs font-semibold uppercase underline underline-offset-4">
              Remover cupom
            </button>
          </div>
        ) : (
          <div className="mt-2 flex gap-2">
            <Input id="cart-coupon" value={code} onChange={(event) => setCode(event.target.value)} placeholder="DESAPEGO10" />
            <Button type="button" onClick={applyCoupon} disabled={loading || !code.trim()}>
              {loading ? "..." : "Aplicar"}
            </Button>
          </div>
        )}
        {error ? <p className="mt-2 text-xs font-normal text-red-600">{error}</p> : null}
      </div>

      <section className="relative mt-3 rounded-md border border-neutral-200 bg-white px-3 py-2">
        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
          <div>
            <h3 className="text-[10px] font-bold uppercase leading-4 text-neutral-900">Formas de pagamento</h3>
            <p className="text-[11px] font-normal leading-4 text-neutral-500">Pix à vista ou em até 12x no cartão</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold leading-4 text-brand">
              {bestInstallment.label} de {bestInstallment.formattedInstallmentAmount}
            </p>
            <button
              type="button"
              onClick={() => setShowInstallments((current) => !current)}
              className="focus-ring rounded-sm text-[11px] font-semibold leading-4 text-brand underline underline-offset-4 transition hover:text-neutral-950"
              aria-expanded={showInstallments}
            >
              {showInstallments ? "Ocultar parcelas" : "Ver parcelas"}
            </button>
          </div>
        </div>

        {showInstallments ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-md border border-neutral-200 bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between gap-3 border-b border-neutral-100 pb-2">
              <p className="text-xs font-bold uppercase text-neutral-950">Parcelamento</p>
              <button
                type="button"
                onClick={() => setShowInstallments(false)}
                className="focus-ring rounded-sm text-xs font-semibold uppercase text-neutral-500 hover:text-brand"
              >
                Fechar
              </button>
            </div>
            <div className="grid max-h-72 gap-1 overflow-auto text-xs text-neutral-700 sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex items-center justify-between gap-3 rounded-md bg-neutral-50 px-3 py-2">
                <span className="font-semibold">Pix</span>
                <strong className="text-neutral-950">À vista</strong>
              </div>
              {installments.map((option) => (
                <div key={option.installments} className="flex items-center justify-between gap-3 rounded-md bg-neutral-50 px-3 py-2">
                  <span className="font-semibold">{option.installments === 1 ? "Crédito à vista" : option.label}</span>
                  <strong className="text-right text-neutral-950">
                    {option.installments === 1
                      ? option.formattedInstallmentAmount
                      : `${option.label} de ${option.formattedInstallmentAmount}`}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
      {disabled ? (
        <Button className="mt-6 w-full gap-2" disabled>
          <Truck size={18} />
          Informar entrega
        </Button>
      ) : (
        <Button href="/entrega" className="mt-6 w-full gap-2">
          <Truck size={18} />
          Informar entrega
        </Button>
      )}
      <p className="mt-4 text-xs font-normal leading-5 text-neutral-600">
        Você poderá finalizar com Pix ou cartão na próxima etapa.
      </p>
    </aside>
  );
}
