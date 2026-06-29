"use client";

import { Truck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import { calculateInstallments } from "@/lib/installments";
import type { CartItem } from "@/types/cart";

export function CartSummary({ items, total }: { items: CartItem[]; total: number }) {
  const [showInstallments, setShowInstallments] = useState(false);
  const disabled = items.length === 0;
  const installments = calculateInstallments(total);
  const bestInstallment = installments[installments.length - 1];

  return (
    <aside className="rounded-md border border-neutral-200 bg-neutral-50 p-5">
      <h2 className="font-display text-xl font-black uppercase text-neutral-950">Resumo da sacola</h2>
      <div className="mt-4 grid gap-2 text-sm text-neutral-700">
        {items.map((item) => (
          <div key={`${item.product.id}-${item.size}`} className="flex justify-between gap-3">
            <span>
              {item.quantity}x {item.product.name}
              {item.size ? ` · ${item.size}` : ""}
            </span>
            <strong>{formatPrice(item.product.price * item.quantity)}</strong>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-neutral-200 pt-5">
        <span className="font-black uppercase text-neutral-700">Subtotal</span>
        <span className="font-display text-2xl font-black text-brand">{formatPrice(total)}</span>
      </div>
      <section className="relative mt-4 rounded-md border border-neutral-200 bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-black uppercase text-neutral-950">Formas de pagamento</h3>
            <p className="mt-1 text-xs font-semibold text-neutral-600">Pix à vista ou em até 12x no cartão</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm font-black text-brand">
              {bestInstallment.label} de {bestInstallment.formattedInstallmentAmount}
            </p>
            <button
              type="button"
              onClick={() => setShowInstallments((current) => !current)}
              className="focus-ring mt-1 rounded-sm text-xs font-black uppercase text-neutral-600 underline underline-offset-4 transition hover:text-brand"
              aria-expanded={showInstallments}
            >
              {showInstallments ? "Ocultar parcelas" : "Ver parcelas"}
            </button>
          </div>
        </div>

        {showInstallments ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-md border border-neutral-200 bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between gap-3 border-b border-neutral-100 pb-2">
              <p className="text-xs font-black uppercase text-neutral-950">Parcelamento</p>
              <button
                type="button"
                onClick={() => setShowInstallments(false)}
                className="focus-ring rounded-sm text-xs font-black uppercase text-neutral-500 hover:text-brand"
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
      <p className="mt-4 text-xs font-bold leading-5 text-neutral-600">
        Você poderá finalizar com Pix ou cartão na próxima etapa.
      </p>
    </aside>
  );
}
