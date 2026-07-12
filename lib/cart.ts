import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

export const cartStorageKey = "desapego-soares-cart";

export function getCartItemKey(productId: string, size: string, variation: string) {
  return `${productId}:${size}:${variation}`;
}

export function addProductToCart(items: CartItem[], product: Product, size: string, variation: string) {
  if (product.sold_out || product.stock_quantity <= 0) {
    return items;
  }

  const current = items.find(
    (item) => item.product.id === product.id && item.size === size && (item.variation ?? "") === variation
  );

  if (current) {
    return items.map((item) =>
      item.product.id === product.id && item.size === size && (item.variation ?? "") === variation
        ? { ...item, variation, quantity: Math.min(item.quantity + 1, product.stock_quantity) }
        : item
    );
  }

  return [...items, { product, size, variation, quantity: 1 }];
}

export function updateCartQuantity(items: CartItem[], productId: string, size: string, variation: string, quantity: number) {
  if (quantity <= 0) {
    return items.filter(
      (item) => getCartItemKey(item.product.id, item.size, item.variation) !== getCartItemKey(productId, size, variation)
    );
  }

  return items.map((item) => {
    if (item.product.id !== productId || item.size !== size || (item.variation ?? "") !== variation) return item;

    return { ...item, variation, quantity: Math.min(quantity, item.product.stock_quantity) };
  });
}
