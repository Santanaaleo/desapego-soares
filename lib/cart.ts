import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

export const cartStorageKey = "desapego-soares-cart";

export function getCartItemKey(productId: string, size: string) {
  return `${productId}:${size}`;
}

export function addProductToCart(items: CartItem[], product: Product, size: string) {
  if (product.sold_out || product.stock_quantity <= 0) {
    return items;
  }

  const current = items.find((item) => item.product.id === product.id && item.size === size);

  if (current) {
    return items.map((item) =>
      item.product.id === product.id && item.size === size
        ? { ...item, quantity: Math.min(item.quantity + 1, product.stock_quantity) }
        : item
    );
  }

  return [...items, { product, size, quantity: 1 }];
}

export function updateCartQuantity(items: CartItem[], productId: string, size: string, quantity: number) {
  if (quantity <= 0) {
    return items.filter((item) => getCartItemKey(item.product.id, item.size) !== getCartItemKey(productId, size));
  }

  return items.map((item) => {
    if (item.product.id !== productId || item.size !== size) return item;

    return { ...item, quantity: Math.min(quantity, item.product.stock_quantity) };
  });
}
