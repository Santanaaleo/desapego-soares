"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { addProductToCart, cartStorageKey } from "@/lib/cart";
import { formatPrice } from "@/lib/formatters";
import { calculateBestInstallment } from "@/lib/installments";
import { getProductSale } from "@/lib/product-pricing";
import { getProductSizeGrid, normalizeSizes } from "@/lib/product-sizes";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

export function ProductDetails({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariation, setSelectedVariation] = useState("");
  const [error, setError] = useState("");
  const availableSizes = normalizeSizes(product.sizes);
  const availableSizeSet = new Set(availableSizes);
  const displayedSizes = getProductSizeGrid(product);
  const availableVariations = Array.from(new Set((product.variations ?? []).map((variation) => variation.trim()).filter(Boolean)));
  const bestInstallment = calculateBestInstallment(product.price);
  const unavailable = product.sold_out || product.stock_quantity <= 0;
  const noAvailableConfiguredSize = displayedSizes.length > 0 && availableSizes.length === 0;
  const sale = getProductSale(product);

  function addToCart() {
    if (unavailable) {
      setError("Este produto está esgotado e não pode ser adicionado a sacola.");
      setAdded(false);
      return;
    }

    if (noAvailableConfiguredSize) {
      setError("Este produto não possui tamanho disponível no momento.");
      setAdded(false);
      return;
    }

    if (availableSizes.length && !selectedSize) {
      setError("Selecione um tamanho antes de adicionar a sacola.");
      setAdded(false);
      return;
    }

    if (availableVariations.length && !selectedVariation) {
      setError("Selecione uma opção.");
      setAdded(false);
      return;
    }

    const stored = window.localStorage.getItem(cartStorageKey);
    const items = stored ? (JSON.parse(stored) as CartItem[]) : [];
    const currentQuantity =
      items.find(
        (item) => item.product.id === product.id && item.size === selectedSize && (item.variation ?? "") === selectedVariation
      )?.quantity ?? 0;
    const nextItems = addProductToCart(items, product, selectedSize, selectedVariation);
    const nextQuantity =
      nextItems.find(
        (item) => item.product.id === product.id && item.size === selectedSize && (item.variation ?? "") === selectedVariation
      )?.quantity ?? 0;

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
          <span className="mt-3 inline-flex rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold uppercase text-white">
            Esgotado
          </span>
        ) : null}
        <h1 className="mt-2 text-3xl font-bold uppercase leading-tight text-neutral-950 sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-2 text-sm font-normal uppercase text-neutral-500">{product.brand}</p>
      </div>

      <div>
        {sale ? (
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-neutral-400 line-through">{formatPrice(sale.compareAtPrice)}</span>
            <span className="rounded-full bg-brand-mist px-2.5 py-1 text-xs font-semibold uppercase text-brand">
              {sale.percentOff}% OFF
            </span>
          </div>
        ) : null}
        <p className="text-3xl font-bold text-neutral-950">{formatPrice(product.price)}</p>
        {sale ? <p className="mt-1 text-sm font-semibold text-brand">Economize {formatPrice(sale.savings)}</p> : null}
        <p className="mt-1 text-sm font-normal text-neutral-600">
          ou {bestInstallment.label} de {bestInstallment.formattedInstallmentAmount} no cartão
        </p>
      </div>
      {unavailable ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-normal text-red-700">
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

      {displayedSizes.length ? (
        <div>
          <p className="mb-3 text-sm font-semibold uppercase text-neutral-950">Escolha o tamanho</p>
          <div className="grid grid-cols-4 gap-2">
            {displayedSizes.map((size) => {
              const sizeAvailable = availableSizeSet.has(size) && !unavailable;

              return (
                <button
                  key={size}
                  type="button"
                  disabled={!sizeAvailable}
                  aria-disabled={!sizeAvailable}
                  aria-label={sizeAvailable ? `Tamanho ${size}` : `Tamanho ${size} indisponível`}
                  onClick={() => {
                    setSelectedSize(size);
                    setError("");
                  }}
                  className={`focus-ring relative h-11 overflow-hidden rounded-md border text-sm font-semibold transition ${
                    !sizeAvailable
                      ? "size-option-unavailable cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                      : selectedSize === size
                        ? "border-brand bg-brand text-white"
                        : "border-neutral-300 bg-white text-neutral-950 hover:border-brand hover:text-brand"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {availableVariations.length ? (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold uppercase text-neutral-950">Escolha a opção</legend>
          <div className="grid gap-2">
            {availableVariations.map((variation) => (
              <label
                key={variation}
                className={`focus-within:ring-2 focus-within:ring-brand/30 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-4 text-sm font-semibold transition ${
                  selectedVariation === variation
                    ? "border-brand bg-brand-mist text-brand"
                    : "border-neutral-300 bg-white text-neutral-950 hover:border-brand"
                }`}
              >
                <input
                  type="radio"
                  name="product-variation"
                  value={variation}
                  checked={selectedVariation === variation}
                  onChange={() => {
                    setSelectedVariation(variation);
                    setError("");
                  }}
                  className="accent-brand"
                />
                {variation}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {error ? <p className="text-sm font-normal text-red-600">{error}</p> : null}

      <Button
        onClick={addToCart}
        className="gap-2 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
        disabled={unavailable || noAvailableConfiguredSize}
      >
        <ShoppingBag size={18} />
        {unavailable ? "Esgotado" : noAvailableConfiguredSize ? "Tamanhos indisponíveis" : added ? "Adicionar mais uma" : "Adicionar a sacola"}
      </Button>
      {added ? (
        <div className="rounded-md border border-brand/30 bg-brand-mist p-3 text-sm font-normal text-brand">
          Produto adicionado a sacola.{" "}
          <Link href="/carrinho" className="underline underline-offset-4 hover:text-neutral-950">
            Ver sacola
          </Link>
        </div>
      ) : null}
    </div>
  );
}
