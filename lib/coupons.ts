export const couponStorageKey = "desapego-soares-coupon";

export function normalizeCouponCode(code: unknown) {
  return typeof code === "string" ? code.trim().replace(/\s+/g, "").toUpperCase() : "";
}

export function calculateCouponDiscount(subtotal: number, discountPercent: number) {
  const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  return Math.min(subtotal, discount);
}
