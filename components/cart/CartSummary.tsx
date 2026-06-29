"use client";

import { Truck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import { calculateInstallments } from "@/lib/installments";
import type { CartItem } from "@/types/cart";

export function CartSummary({ items, total }: { items: CartItem[]; total: number }) {
  const [showAllInstallments, setShowAllInstallments] = useState(false);
  const disabled = items.length === 0;
  const installments = calculateInstallments(total);
  const visibleInstallments = showAllInstallments ? installments : installments.slice(0, 5);

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
      <section className="mt-5 border-t border-neutral-200 pt-5">
        <h3 className="font-display text-lg font-black uppercase text-neutral-950">Formas de pagamento</h3>

        <div className="mt-4 rounded-md border border-neutral-200 bg-white p-4">
          <p className="text-sm font-black uppercase text-neutral-950">Pix</p>
          <p className="mt-1 text-sm font-semibold text-neutral-600">À vista</p>
        </div>

        <div className="mt-3 rounded-md border border-neutral-200 bg-white p-4">
          <p className="text-sm font-black uppercase text-neutral-950">Cartão de crédito</p>
          <div className="mt-3 grid gap-2 text-sm text-neutral-700 sm:grid-cols-2 lg:grid-cols-1">
            {visibleInstallments.map((option) => (
              <div key={option.installments} className="flex items-center justify-between gap-3 rounded-md bg-neutral-50 px-3 py-2">
                <span className="font-semibold">{option.installments === 1 ? "À vista" : option.label}</span>
                <strong className="text-right text-neutral-950">
                  {option.installments === 1
                    ? option.formattedInstallmentAmount
                    : `${option.label} de ${option.formattedInstallmentAmount}`}
                </strong>
              </div>
            ))}
          </div>
          {!showAllInstallments ? (
            <button
              type="button"
              onClick={() => setShowAllInstallments(true)}
              className="focus-ring mt-3 w-full rounded-md border border-neutral-300 px-4 py-2 text-xs font-black uppercase text-neutral-950 transition hover:border-brand hover:text-brand"
            >
              Ver todas as parcelas
            </button>
          ) : null}
        </div>
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
