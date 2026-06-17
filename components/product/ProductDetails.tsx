"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { addProductToCart, cartStorageKey } from "@/lib/cart";
import { formatPrice } from "@/lib/formatters";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

export function ProductDetails({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [error, setError] = useState("");
  const availableSizes = product.sizes.filter(Boolean);

  function addToCart() {
    if (availableSizes.length && !selectedSize) {
      setError("Selecione um tamanho antes de adicionar a sacola.");
      setAdded(false);
      return;
    }

    const stored = window.localStorage.getItem(cartStorageKey);
    const items = stored ? (JSON.parse(stored) as CartItem[]) : [];
    window.localStorage.setItem(cartStorageKey, JSON.stringify(addProductToCart(items, product, selectedSize)));
    window.dispatchEvent(new Event("cart-updated"));
    setError("");
    setAdded(true);
  }

  return (
    <div className="grid content-start gap-5">
      <div>
        <p className="text-xs font-semibold uppercase text-brand">{product.category}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold uppercase leading-tight text-neutral-950 sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-2 text-sm font-medium uppercase text-neutral-500">{product.brand}</p>
      </div>

      <p className="font-display text-3xl font-extrabold text-neutral-950">{formatPrice(product.price)}</p>
      <p className="text-sm leading-6 text-neutral-700">{product.description}</p>

      <div className="grid gap-2 border-y border-neutral-200 py-4 text-sm">
        <p>
          <strong>Condicao:</strong> {product.condition}
        </p>
        {availableSizes.length ? (
          <p>
            <strong>Tamanhos disponiveis:</strong> {availableSizes.join(", ")}
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

      <Button onClick={addToCart} className="gap-2">
        <ShoppingBag size={18} />
        {added ? "Adicionar mais uma" : "Adicionar a sacola"}
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
