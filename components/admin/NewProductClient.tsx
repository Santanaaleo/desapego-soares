"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { ProductForm } from "@/components/admin/ProductForm";
import { useProducts } from "@/hooks/useProducts";
import type { ProductInput } from "@/types/product";

export function NewProductClient() {
  const router = useRouter();
  const { createProduct } = useProducts({ admin: true });
  const [error, setError] = useState("");

  async function handleSubmit(input: ProductInput) {
    try {
      await createProduct(input);
      router.push("/admin");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível cadastrar o produto.");
    }
  }

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-4xl">
        <h1 className="mb-8 font-display text-4xl font-black text-neutral-950">Cadastrar produto</h1>
        {error ? <p className="mb-4 text-sm font-bold text-red-600">{error}</p> : null}
        <ProductForm onSubmit={handleSubmit} />
      </Container>
    </section>
  );
}
