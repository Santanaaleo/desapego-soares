"use client";

import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductGallery } from "@/components/product/ProductGallery";
import { useProducts } from "@/hooks/useProducts";

export function ProductPageClient({ slug }: { slug: string }) {
  const { products, ready } = useProducts();
  const product = products.find((item) => item.slug === slug && item.active);

  if (!ready) {
    return (
      <section className="py-10 sm:py-14">
        <Container>
          <p className="font-bold text-neutral-600">Carregando produto...</p>
        </Container>
      </section>
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <section className="py-10 sm:py-14">
      <Container className="grid gap-10 lg:grid-cols-[0.95fr_1fr]">
        <ProductGallery images={product.images} name={product.name} />
        <ProductDetails product={product} />
      </Container>
    </section>
  );
}
