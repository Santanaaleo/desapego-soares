import { Container } from "@/components/layout/Container";
import { CatalogPageClient } from "@/components/catalog/CatalogPageClient";

export default function CatalogoPage() {
  return (
    <section className="py-6 sm:py-8">
      <Container>
        <div className="mb-5 max-w-2xl">
          <p className="text-xs font-black uppercase text-brand">Catálogo</p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase text-neutral-950 sm:text-4xl">
            Produtos disponíveis
          </h1>
          <p className="mt-2 text-sm font-bold text-neutral-600">Busque por marca, categoria ou detalhe da peça.</p>
        </div>
        <CatalogPageClient />
      </Container>
    </section>
  );
}
