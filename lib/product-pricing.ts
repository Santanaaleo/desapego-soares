import type { Product } from "@/types/product";

export function getProductSale(product: Pick<Product, "price" | "compare_at_price" | "sale_active">) {
  const compareAtPrice = product.compare_at_price;
  const isActive = product.sale_active && compareAtPrice !== null && compareAtPrice > product.price;

  if (!isActive) {
    return null;
  }

  const savings = Math.round((compareAtPrice - product.price) * 100) / 100;
  const percentOff = Math.round((savings / compareAtPrice) * 100);

  return {
    compareAtPrice,
    savings,
    percentOff
  };
}
