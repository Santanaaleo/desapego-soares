"use client";

import { notFound, useRouter } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { ProductForm } from "@/components/admin/ProductForm";
import { useProducts } from "@/hooks/useProducts";
import type { ProductInput } from "@/types/product";

export function EditProductClient({ id }: { id: string }) {
  const router = useRouter();
  const { products, ready, updateProduct } = useProducts({ admin: true });
  const [error, setError] = useState("");
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

  async function handleSubmit(input: ProductInput) {
    try {
      await updateProduct(id, input);
      router.push("/admin");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível salvar o produto.");
    }
  }

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-4xl">
        <h1 className="mb-8 font-display text-4xl font-black text-neutral-950">Editar Produto</h1>
        {error ? <p className="mb-4 text-sm font-bold text-red-600">{error}</p> : null}
        <ProductForm product={product} onSubmit={handleSubmit} />
      </Container>
    </section>
  );
}
