"use client";

import { Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import type { CartItem } from "@/types/cart";

export function CartSummary({ items, total }: { items: CartItem[]; total: number }) {
  const disabled = items.length === 0;

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
