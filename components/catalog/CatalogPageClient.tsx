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
  const { products, ready } = useProducts();

  if (!ready) {
    return (
      <div className="grid gap-5">
        <div className="grid gap-3 rounded-md border border-neutral-200 bg-white p-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="h-11 animate-pulse rounded-md bg-neutral-100" />
          <div className="flex gap-2 overflow-hidden pb-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-10 w-24 shrink-0 animate-pulse rounded-md bg-neutral-100" />
            ))}
          </div>
        </div>
        <div className="grid auto-rows-fr grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="mx-auto h-[420px] w-[94%] animate-pulse rounded-md bg-neutral-100 md:h-[470px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <CatalogFilters
      products={products.filter((product) => product.active)}
      initialQuery={initialQuery}
      initialCategory={initialCategory}
    />
  );
}
