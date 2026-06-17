"use client";

import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { useProducts } from "@/hooks/useProducts";

export function CatalogPageClient({
  initialQuery = "",
  initialCategory = "Todos"
}: {
  initialQuery?: string;
  initialCategory?: string;
}) {
  const { products } = useProducts();
  return (
    <CatalogFilters
      products={products.filter((product) => product.active)}
      initialQuery={initialQuery}
      initialCategory={initialCategory}
    />
  );
}
