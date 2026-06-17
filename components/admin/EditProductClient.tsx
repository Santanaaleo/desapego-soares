"use client";

import { notFound, useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProductForm } from "@/components/admin/ProductForm";
import { useProducts } from "@/hooks/useProducts";
import type { ProductInput } from "@/types/product";

export function EditProductClient({ id }: { id: string }) {
  const router = useRouter();
  const { products, ready, updateProduct } = useProducts();
  const product = products.find((item) => item.id === id);

  if (!ready) {
    return (
      <section className="py-10 sm:py-14">
        <Container className="max-w-4xl">
          <p className="font-bold text-neutral-600">Carregando produto...</p>
        </Container>
      </section>
    );
  }

  if (!product) {
    notFound();
  }

  function handleSubmit(input: ProductInput) {
    updateProduct(id, input);
    router.push("/admin");
  }

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-4xl">
        <h1 className="mb-8 font-display text-4xl font-black text-neutral-950">Editar Produto</h1>
        <ProductForm product={product} onSubmit={handleSubmit} />
      </Container>
    </section>
  );
}
