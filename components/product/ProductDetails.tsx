"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { addProductToCart, cartStorageKey } from "@/lib/cart";
import { formatPrice } from "@/lib/formatters";
import { calculateBestInstallment } from "@/lib/installments";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

export function ProductDetails({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [error, setError] = useState("");
  const availableSizes = product.sizes.filter(Boolean);
  const bestInstallment = calculateBestInstallment(product.price);
  const unavailable = product.sold_out || product.stock_quantity <= 0;

  function addToCart() {
    if (unavailable) {
      setError("Este produto está esgotado e não pode ser adicionado a sacola.");
      setAdded(false);
      return;
    }

    if (availableSizes.length && !selectedSize) {
      setError("Selecione um tamanho antes de adicionar a sacola.");
      setAdded(false);
      return;
    }

    const stored = window.localStorage.getItem(cartStorageKey);
    const items = stored ? (JSON.parse(stored) as CartItem[]) : [];
    const currentQuantity = items.find((item) => item.product.id === product.id && item.size === selectedSize)?.quantity ?? 0;
    const nextItems = addProductToCart(items, product, selectedSize);
    const nextQuantity = nextItems.find((item) => item.product.id === product.id && item.size === selectedSize)?.quantity ?? 0;

    if (nextQuantity <= currentQuantity) {
      setError("Quantidade máxima disponível em estoque.");
      setAdded(false);
      return;
    }

    window.localStorage.setItem(cartStorageKey, JSON.stringify(nextItems));
    window.dispatchEvent(new Event("cart-updated"));
    setError("");
    setAdded(true);
  }

  return (
    <div className="grid content-start gap-5">
      <div>
        <p className="text-xs font-semibold uppercase text-brand">{product.category}</p>
        {unavailable ? (
          <span className="mt-3 inline-flex rounded-full bg-neutral-950 px-3 py-1 text-xs font-black uppercase text-white">
            Esgotado
          </span>
        ) : null}
        <h1 className="mt-2 font-display text-3xl font-semibold uppercase leading-tight text-neutral-950 sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-2 text-sm font-medium uppercase text-neutral-500">{product.brand}</p>
      </div>

      <div>
        <p className="font-display text-3xl font-extrabold text-neutral-950">{formatPrice(product.price)}</p>
        <p className="mt-1 text-sm font-semibold text-neutral-600">
          ou {bestInstallment.label} de {bestInstallment.formattedInstallmentAmount} no cartão
        </p>
      </div>
      {unavailable ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          Produto esgotado no momento. Ele permanece visível apenas como parte do catálogo.
        </div>
      ) : null}
      <p className="text-sm leading-6 text-neutral-700">{product.description}</p>

      <div className="grid gap-2 border-y border-neutral-200 py-4 text-sm">
        <p>
          <strong>Condição:</strong> {product.condition}
        </p>
        {availableSizes.length ? (
          <p>
            <strong>Tamanhos disponíveis:</strong> {availableSizes.join(", ")}
          </p>
        ) : null}
      </div>

      {availableSizes.length ? (
        <div>
          <p className="mb-3 text-sm font-semibold uppercase text-neutral-950">Escolha o tamanho</p>
          <div className="grid grid-cols-4 gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setSelectedSize(size);
                  setError("");
                }}
                className={`focus-ring h-11 rounded-md border text-sm font-semibold transition ${
                  selectedSize === size
                    ? "border-brand bg-brand text-white"
                    : "border-neutral-300 bg-white text-neutral-950 hover:border-brand hover:text-brand"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {error ? <p className="mt-3 text-sm font-bold text-red-600">{error}</p> : null}
        </div>
      ) : null}

      <Button onClick={addToCart} className="gap-2 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600" disabled={unavailable}>
        <ShoppingBag size={18} />
        {unavailable ? "Esgotado" : added ? "Adicionar mais uma" : "Adicionar a sacola"}
      </Button>
      {added ? (
        <div className="rounded-md border border-brand/30 bg-brand-mist p-3 text-sm font-bold text-brand">
          Produto adicionado a sacola.{" "}
          <Link href="/carrinho" className="underline underline-offset-4 hover:text-neutral-950">
            Ver sacola
          </Link>
        </div>
      ) : null}
    </div>
  );
}
