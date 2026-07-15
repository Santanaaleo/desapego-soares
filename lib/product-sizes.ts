import type { Product, ProductCategory } from "@/types/product";

export type ProductSizeType = "letters" | "numbers" | "none";

export const letterSizes = ["P", "M", "G", "GG"];
export const shoeSizes = ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"];
export const pantsSizes = ["36", "38", "40", "42", "44", "46", "48"];

export function normalizeSizes(sizes: string[] | undefined) {
  return Array.from(new Set((sizes ?? []).map((size) => size.trim()).filter(Boolean)));
}

export function isNumericSize(size: string) {
  return /^\d+(?:[./-]\d+)*$/.test(size.trim());
}

export function inferProductSizeType(product: Pick<Product, "sizes" | "size_options">): ProductSizeType {
  const configuredSizes = normalizeSizes(product.size_options);
  const source = configuredSizes.length ? configuredSizes : normalizeSizes(product.sizes);

  if (!source.length) return "none";
  return source.every(isNumericSize) ? "numbers" : "letters";
}

export function getDefaultNumericSizes(category: ProductCategory) {
  if (category === "Tênis") return shoeSizes;
  if (category === "Calças") return pantsSizes;
  return [];
}

export function getProductSizeGrid(product: Pick<Product, "category" | "sizes" | "size_options">) {
  const availableSizes = normalizeSizes(product.sizes);
  const configuredSizes = normalizeSizes(product.size_options);
  const type = inferProductSizeType(product);

  if (type === "none") return [];
  if (configuredSizes.length) return normalizeSizes([...configuredSizes, ...availableSizes]);
  if (type === "letters") {
    const hasStandardLetterSize = availableSizes.some((size) => letterSizes.includes(size));
    return hasStandardLetterSize ? normalizeSizes([...letterSizes, ...availableSizes]) : availableSizes;
  }
  return normalizeSizes([...getDefaultNumericSizes(product.category), ...availableSizes]);
}
