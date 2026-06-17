import { formatPrice } from "@/lib/formatters";
import type { ShippingEstimate, ShippingOption } from "@/types/shipping";

export const shippingStorageKey = "desapego-soares-shipping-estimate";
export const shippingMessage = "Frete estimado. Valor final confirmado no WhatsApp.";

export function normalizeCep(value: string) {
  return value.replace(/\D/g, "");
}

export function readStoredShippingEstimate() {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(shippingStorageKey);
    return stored ? (JSON.parse(stored) as ShippingEstimate) : null;
  } catch {
    return null;
  }
}

export function storeShippingEstimate(estimate: ShippingEstimate) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(shippingStorageKey, JSON.stringify(estimate));
}

export function getSelectedShippingOption(estimate?: ShippingEstimate | null) {
  if (!estimate) return null;
  return estimate.options.find((option) => option.service === estimate.selectedService) ?? estimate.options[0] ?? null;
}

export function formatShippingOption(option: ShippingOption) {
  return `${option.service}: ${formatPrice(option.price)} - prazo aprox. ${option.deliveryTime} dia${
    option.deliveryTime === 1 ? "" : "s"
  } úteis`;
}
