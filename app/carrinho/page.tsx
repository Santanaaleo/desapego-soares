"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";

export default function CarrinhoPage() {
  const { items, total, remove, updateQuantity } = useCart();

  return (
    <section className="py-6 sm:py-8">
      <Container>
        <div className="mb-5">
          <p className="text-xs font-black uppercase text-brand">Sacola</p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase leading-none text-neutral-950 sm:text-4xl">
            Produtos separados
          </h1>
        </div>

        {items.length ? (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
            <div className="grid content-start gap-4">
              {items.map((item) => (
                <CartItem
                  key={`${item.product.id}-${item.size}-${item.variation}`}
                  item={item}
                  onRemove={remove}
                  onQuantity={updateQuantity}
                />
              ))}
            </div>
            <CartSummary items={items} total={total} />
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-neutral-300 p-10 text-center">
            <p className="font-bold text-neutral-700">Sua sacola está vazia.</p>
            <Button href="/catalogo" className="mt-5">
              Ver catálogo
            </Button>
          </div>
        )}
        <Link href="/catalogo" className="mt-8 inline-block text-sm font-bold text-brand hover:text-brand-secondary">
          Continuar vendo produtos
        </Link>
      </Container>
    </section>
  );
}
