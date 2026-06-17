"use client";

import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProductForm } from "@/components/admin/ProductForm";
import { useProducts } from "@/hooks/useProducts";
import type { ProductInput } from "@/types/product";

export function NewProductClient() {
  const router = useRouter();
  const { createProduct } = useProducts();

  async function handleSubmit(input: ProductInput) {
    await createProduct(input);
    router.push("/admin");
  }

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-4xl">
        <h1 className="mb-8 font-display text-4xl font-black text-neutral-950">Cadastrar Produto</h1>
        <ProductForm onSubmit={handleSubmit} />
      </Container>
    </section>
  );
}
