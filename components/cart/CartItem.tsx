"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/formatters";
import type { CartItem as CartItemType } from "@/types/cart";

type Props = {
  item: CartItemType;
  onRemove: (id: string, size: string) => void;
  onQuantity: (id: string, size: string, quantity: number) => void;
};

export function CartItem({ item, onRemove, onQuantity }: Props) {
  const subtotal = item.product.price * item.quantity;

  return (
    <div className="grid self-start grid-cols-[92px_1fr] gap-4 rounded-md border border-neutral-200 bg-white p-3 sm:grid-cols-[120px_1fr_auto]">
      <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-100">
        <Image src={item.product.images[0]} alt={item.product.name} fill sizes="120px" className="object-contain object-center p-2" />
      </div>
      <div className="grid content-center gap-1">
        <p className="font-display text-base font-black uppercase text-neutral-950">{item.product.name}</p>
        <p className="text-xs font-bold uppercase text-neutral-500">{item.product.brand}</p>
        {item.size ? <p className="text-sm font-bold text-neutral-700">Tamanho: {item.size}</p> : null}
        <p className="font-bold text-brand">
          {formatPrice(item.product.price)} · Subtotal {formatPrice(subtotal)}
        </p>
      </div>
      <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
        <div className="flex h-10 items-center rounded-md border border-neutral-300 bg-white">
          <button
            type="button"
            className="focus-ring flex h-10 w-10 items-center justify-center"
            onClick={() => onQuantity(item.product.id, item.size, item.quantity - 1)}
            aria-label="Diminuir quantidade"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
          <button
            type="button"
            className="focus-ring flex h-10 w-10 items-center justify-center"
            onClick={() => onQuantity(item.product.id, item.size, item.quantity + 1)}
            aria-label="Aumentar quantidade"
          >
            <Plus size={16} />
          </button>
        </div>
        <button
          type="button"
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
          onClick={() => onRemove(item.product.id, item.size)}
          aria-label="Remover produto"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
