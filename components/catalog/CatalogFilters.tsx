"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { categories } from "@/lib/constants";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product } from "@/types/product";

export function CatalogFilters({
  products,
  initialQuery = "",
  initialCategory = "Todos"
}: {
  products: Product[];
  initialQuery?: string;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const text = `${product.name} ${product.brand} ${product.category} ${product.description}`.toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesCategory = category === "Todos" || product.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, products, query]);

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 rounded-md border border-neutral-200 bg-white p-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar produto, marca ou categoria"
            className="pl-11"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["Todos", ...categories].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`focus-ring h-10 shrink-0 rounded-md px-4 text-sm font-semibold uppercase transition ${
                category === item ? "bg-brand text-white" : "bg-neutral-100 text-neutral-950 hover:bg-neutral-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <ProductGrid products={filtered} />
    </div>
  );
}
