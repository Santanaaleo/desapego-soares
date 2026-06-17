import { ProductPageClient } from "@/components/product/ProductPageClient";
import { getProducts } from "@/lib/mock-products";

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
