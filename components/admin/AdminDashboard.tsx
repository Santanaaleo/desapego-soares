"use client";

import { Plus } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { ProductTable } from "@/components/admin/ProductTable";
import { useProducts } from "@/hooks/useProducts";
import { LogoutButton } from "./LogoutButton";

export function AdminDashboard() {
  const { products, deleteProduct, toggleProductActive, toggleProductFeatured } = useProducts({ admin: true });

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-brand">Admin</p>
            <h1 className="mt-2 text-4xl font-bold text-neutral-950 sm:text-5xl">Produtos</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/admin/pedidos" variant="secondary">
              Pedidos
            </Button>
            <Button href="/admin/cupons" variant="secondary">
              Cupons
            </Button>
            <Button href="/admin/produtos/novo" className="gap-2">
              <Plus size={18} />
              Novo Produto
            </Button>
            <LogoutButton />
          </div>
        </div>
        <ProductTable
          products={products}
          onDelete={deleteProduct}
          onToggleActive={toggleProductActive}
          onToggleFeatured={toggleProductFeatured}
        />
      </Container>
    </section>
  );
}
