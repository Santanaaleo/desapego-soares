import { getFeaturedProducts } from "@/lib/mock-products";
import { filterAvailableProducts } from "@/lib/products";
import { ProductGrid } from "./ProductGrid";

export function FeaturedProducts() {
  return <ProductGrid products={filterAvailableProducts(getFeaturedProducts())} />;
}
