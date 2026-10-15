import type { Product, ProductCategory } from "@/types/product";

export function normalizeProductCategory(category: string) {
  const normalized = category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  return normalized === "oculos" ? "Acessórios" : category;
}

export function normalizeProduct(product: Product): Product {
  return {
    ...product,
    category: normalizeProductCategory(product.category) as ProductCategory
  };
}

export function isProductSoldOut(product: Product) {
  return product.sold_out || product.stock_quantity <= 0;
}

export function sortProductsWithSoldOutLast(products: Product[]) {
  return [...products].sort((a, b) => Number(isProductSoldOut(a)) - Number(isProductSoldOut(b)));
}

export function filterAvailableProducts(products: Product[]) {
  return products.filter((product) => !isProductSoldOut(product));
}
