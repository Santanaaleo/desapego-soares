"use client";

import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { useProducts } from "@/hooks/useProducts";

export function CatalogPageClient() {
  const { products } = useProducts();
  return <CatalogFilters products={products.filter((product) => product.active)} />;
}
