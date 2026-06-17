"use client";

import { useEffect, useState } from "react";
import { mockProducts } from "@/lib/mock-products";
import type { Product, ProductInput } from "@/types/product";

const storageKey = "desapego-soares-products";

function readProducts() {
  if (typeof window === "undefined") {
    return mockProducts;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as Product[]) : mockProducts;
  } catch {
    return mockProducts;
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setProducts(readProducts());
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(products));
  }, [products, ready]);

  function createProduct(input: ProductInput) {
    const now = new Date().toISOString();
    setProducts((current) => [
      {
        ...input,
        id: crypto.randomUUID(),
        created_at: now,
        updated_at: now
      },
      ...current
    ]);
  }

  function updateProduct(id: string, input: ProductInput) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, ...input, updated_at: new Date().toISOString() } : product
      )
    );
  }

  function deleteProduct(id: string) {
    setProducts((current) => current.filter((product) => product.id !== id));
  }

  function toggleProductActive(id: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, active: !product.active, updated_at: new Date().toISOString() } : product
      )
    );
  }

  function toggleProductFeatured(id: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, featured: !product.featured, updated_at: new Date().toISOString() } : product
      )
    );
  }

  return {
    products,
    ready,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    toggleProductFeatured
  };
}
