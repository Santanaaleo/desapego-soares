import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductGallery } from "@/components/product/ProductGallery";
import { getProducts } from "@/lib/mock-products";
import { hasSupabaseConfig } from "@/lib/supabase/client";
import { getActiveProductBySlug, listActiveProductSlugs } from "@/lib/supabase/products";

export const dynamicParams = true;
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
  const sharedSlugs = await listActiveProductSlugs().catch(() => null);

  if (sharedSlugs?.length) {
    return sharedSlugs.map((product) => ({ slug: product.slug }));
  }

  if (!hasSupabaseConfig()) {
    return getProducts()
      .filter((product) => product.active)
      .map((product) => ({ slug: product.slug }));
  }

  return [];
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sharedProduct = await getActiveProductBySlug(slug).catch(() => null);
  const product = sharedProduct ?? (hasSupabaseConfig() ? null : getProducts().find((item) => item.slug === slug && item.active));

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
