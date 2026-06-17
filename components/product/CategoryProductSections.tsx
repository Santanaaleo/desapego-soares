"use client";

import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { categories } from "@/lib/constants";
import { ProductCard } from "./ProductCard";

export function CategoryProductSections() {
  const { products } = useProducts();
  const activeProducts = products.filter((product) => product.active);

  return (
    <div className="grid gap-8">
      {categories.map((category) => {
        const categoryProducts = activeProducts
          .filter((product) => product.category === category)
          .slice(0, 8);

        return (
          <section key={category} className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-black uppercase text-neutral-950 sm:text-2xl">{category}</h2>
              <Link
                href={`/catalogo?categoria=${category}`}
                className="text-xs font-black uppercase text-brand hover:text-neutral-950"
              >
                Ver tudo
              </Link>
            </div>

            {categoryProducts.length ? (
              <div className="grid auto-rows-fr grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-5 text-sm font-bold text-neutral-500">
                Em breve novos produtos nessa categoria.
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
