"use client";

import { useEffect, useMemo, useState } from "react";
import { addProductToCart, cartStorageKey, updateCartQuantity } from "@/lib/cart";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

function readCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(cartStorageKey);
    const parsed = value ? (JSON.parse(value) as CartItem[]) : [];
    return parsed.filter((item) => item.product && item.size);
  } catch {
    return [];
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setItems(readCart());
      setReady(true);
    });

    function syncCart() {
      setItems(readCart());
    }

    window.addEventListener("storage", syncCart);
    window.addEventListener("cart-updated", syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("cart-updated", syncCart);
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
  }, [items, ready]);

  function add(product: Product, size: string) {
    setItems((current) => addProductToCart(current, product, size));
  }

  function remove(productId: string, size: string) {
    setItems((current) => current.filter((item) => !(item.product.id === productId && item.size === size)));
  }

  function updateQuantity(productId: string, size: string, quantity: number) {
    setItems((current) => updateCartQuantity(current, productId, size, quantity));
  }

  function clear() {
    setItems([]);
  }

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  return { items, total, add, remove, updateQuantity, clear };
}
