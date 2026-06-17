import { Container } from "@/components/layout/Container";
import { CatalogPageClient } from "@/components/catalog/CatalogPageClient";

type Props = {
  searchParams?: Promise<{
    q?: string;
    categoria?: string;
  }>;
};

export default async function CatalogoPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <section className="py-6 sm:py-8">
      <Container>
        <div className="mb-5 max-w-2xl">
          <p className="text-xs font-semibold uppercase text-brand">Catálogo</p>
          <h1 className="mt-1 font-display text-3xl font-semibold uppercase text-neutral-950 sm:text-4xl">
            Produtos disponíveis
          </h1>
          <p className="mt-2 text-sm font-medium text-neutral-600">Busque por nome, marca ou categoria.</p>
        </div>
        <CatalogPageClient initialQuery={params?.q ?? ""} initialCategory={params?.categoria ?? "Todos"} />
      </Container>
    </section>
  );
}
