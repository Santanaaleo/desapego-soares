import type { Product } from "@/types/product";

export function isProductSoldOut(product: Product) {
  return product.sold_out || product.stock_quantity <= 0;
}

export function sortProductsWithSoldOutLast(products: Product[]) {
  return [...products].sort((a, b) => Number(isProductSoldOut(a)) - Number(isProductSoldOut(b)));
}

export function filterAvailableProducts(products: Product[]) {
  return products.filter((product) => !isProductSoldOut(product));
}
