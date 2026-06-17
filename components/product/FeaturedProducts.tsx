import { getFeaturedProducts } from "@/lib/mock-products";
import { ProductGrid } from "./ProductGrid";

export function FeaturedProducts() {
  return <ProductGrid products={getFeaturedProducts()} />;
}
