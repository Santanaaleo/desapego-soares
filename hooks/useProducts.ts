"use client";

import { useEffect, useState } from "react";
import { mockProducts } from "@/lib/mock-products";
import {
  createProduct as createSupabaseProduct,
  deleteProduct as deleteSupabaseProduct,
  listProducts,
  patchProduct,
  updateProduct as updateSupabaseProduct
} from "@/lib/supabase/products";
import { supabase } from "@/lib/supabase/client";
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

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [ready, setReady] = useState(false);
  const hasSharedDatabase = Boolean(supabase);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const sharedProducts = await listProducts();
        if (!active) return;

        setProducts(sharedProducts ?? readLocalProducts());
      } catch {
        if (active) {
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
  }, []);

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
      const created = await createSupabaseProduct(input);
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
      const updated = await updateSupabaseProduct(id, input);
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
      await deleteSupabaseProduct(id);
    }

    persistLocal(products.filter((product) => product.id !== id));
  }

  async function toggleProductActive(id: string) {
    const product = products.find((item) => item.id === id);
    if (!product) return;

    const active = !product.active;
    const updated = hasSharedDatabase ? await patchProduct(id, { active }) : null;
    const nextProducts = products.map((item) =>
      item.id === id ? updated ?? { ...item, active, updated_at: new Date().toISOString() } : item
    );
    persistLocal(nextProducts);
  }

  async function toggleProductFeatured(id: string) {
    const product = products.find((item) => item.id === id);
    if (!product) return;

    const featured = !product.featured;
    const updated = hasSharedDatabase ? await patchProduct(id, { featured }) : null;
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
