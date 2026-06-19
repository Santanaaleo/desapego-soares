"use client";

import { useEffect, useState } from "react";
import { mockProducts } from "@/lib/mock-products";
import type { Product, ProductInput } from "@/types/product";

const storageKey = "desapego-soares-products";

function readLocalProducts() {
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

function writeLocalProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(products));
}

export function useProducts({ admin = false }: { admin?: boolean } = {}) {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [ready, setReady] = useState(false);
  const [hasSharedDatabase, setHasSharedDatabase] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const response = await fetch(admin ? "/api/admin/products" : "/api/products", { cache: "no-store" });
        if (!response.ok) throw new Error("Produtos indisponíveis.");
        const data = (await response.json()) as { products?: Product[] };
        if (!active) return;

        setHasSharedDatabase(true);
        setProducts(data.products ?? []);
      } catch {
        if (active) {
          setHasSharedDatabase(false);
          setProducts(readLocalProducts());
        }
      } finally {
        if (active) {
          setReady(true);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [admin]);

  function persistLocal(nextProducts: Product[]) {
    setProducts(nextProducts);
    if (!hasSharedDatabase) {
      writeLocalProducts(nextProducts);
    }
  }

  async function createProduct(input: ProductInput) {
    const now = new Date().toISOString();
    const fallbackProduct: Product = {
      ...input,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };

    if (hasSharedDatabase) {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const data = (await response.json().catch(() => null)) as { product?: Product; message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message || "Não foi possível cadastrar o produto.");
      }

      const created = data?.product;
      if (created) {
        setProducts((current) => [created, ...current]);
        return created;
      }
    }

    persistLocal([fallbackProduct, ...products]);
    return fallbackProduct;
  }

  async function updateProduct(id: string, input: ProductInput) {
    if (hasSharedDatabase) {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const data = (await response.json().catch(() => null)) as { product?: Product; message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message || "Não foi possível salvar o produto.");
      }

      const updated = data?.product;
      if (updated) {
        setProducts((current) => current.map((product) => (product.id === id ? updated : product)));
        return updated;
      }
    }

    const nextProducts = products.map((product) =>
      product.id === id ? { ...product, ...input, updated_at: new Date().toISOString() } : product
    );
    persistLocal(nextProducts);
    return nextProducts.find((product) => product.id === id) ?? null;
  }

  async function deleteProduct(id: string) {
    if (hasSharedDatabase) {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message || "Não foi possível excluir o produto.");
      }
    }

    persistLocal(products.filter((product) => product.id !== id));
  }

  async function toggleProductActive(id: string) {
    const product = products.find((item) => item.id === id);
    if (!product) return;

    const active = !product.active;
    const updated = hasSharedDatabase ? await updateProductPatch(id, { active }) : null;
    const nextProducts = products.map((item) =>
      item.id === id ? updated ?? { ...item, active, updated_at: new Date().toISOString() } : item
    );
    persistLocal(nextProducts);
  }

  async function toggleProductFeatured(id: string) {
    const product = products.find((item) => item.id === id);
    if (!product) return;

    const featured = !product.featured;
    const updated = hasSharedDatabase ? await updateProductPatch(id, { featured }) : null;
    const nextProducts = products.map((item) =>
      item.id === id ? updated ?? { ...item, featured, updated_at: new Date().toISOString() } : item
    );
    persistLocal(nextProducts);
  }

  return {
    products,
    ready,
    hasSharedDatabase,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    toggleProductFeatured
  };
}

async function updateProductPatch(id: string, input: Partial<Product>) {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  const data = (await response.json().catch(() => null)) as { product?: Product; message?: string } | null;

  if (!response.ok) {
    throw new Error(data?.message || "Não foi possível atualizar o produto.");
  }

  return data?.product ?? null;
}
