import { brand } from "@/lib/constants";
import { formatPrice } from "@/lib/formatters";
import { formatShippingOption, getSelectedShippingOption, shippingMessage } from "@/lib/shipping";
import type { CartItem } from "@/types/cart";
import type { CheckoutData } from "@/types/checkout";
import type { ShippingEstimate } from "@/types/shipping";

export function buildWhatsAppMessage(items: CartItem[], checkout?: CheckoutData, shipping?: ShippingEstimate | null) {
  const lines = items.map((item) => {
    const itemTotal = item.product.price * item.quantity;
    return [
      `${item.quantity}x ${item.product.name}`,
      item.size ? `Tamanho: ${item.size}` : null,
      item.variation ? `Variação: ${item.variation}` : null,
      `Valor: ${formatPrice(itemTotal)}`
    ]
      .filter(Boolean)
      .join("\n");
  });

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const selectedShipping = getSelectedShippingOption(shipping);
  const finalTotal = subtotal + (selectedShipping?.price ?? 0);

  const checkoutLines = checkout
    ? [
        "",
        "Cliente:",
        `${checkout.firstName} ${checkout.lastName}`,
        `Telefone: ${checkout.phone}`,
        `E-mail: ${checkout.email}`,
        "",
        "Endereço de entrega:",
        `CEP: ${checkout.cep}`,
        `Cidade/UF: ${checkout.city} - ${checkout.state}`,
        `Bairro: ${checkout.neighborhood}`,
        `Rua: ${checkout.street}`,
        `Número: ${checkout.number}`,
        `Complemento: ${checkout.complement || "Não informado"}`,
        "",
        "Nota fiscal:",
        `CPF/CNPJ: ${checkout.document}`
      ]
    : [];

  const shippingLines = selectedShipping
    ? [
        "",
        "Forma de entrega escolhida:",
        formatShippingOption(selectedShipping),
        shippingMessage,
        "",
        `Subtotal dos produtos: ${formatPrice(subtotal)}`,
        `Valor do frete: ${formatPrice(selectedShipping.price)}`,
        `Total final: ${formatPrice(finalTotal)}`
      ]
    : ["", `Subtotal dos produtos: ${formatPrice(subtotal)}`];

  return [
    "Olá.",
    "",
    "Tenho interesse nos seguintes produtos:",
    "",
    lines.join("\n\n"),
    ...checkoutLines,
    ...shippingLines,
    "",
    "Pode me passar disponibilidade e formas de pagamento?"
  ].join("\n");
}

export function buildWhatsAppUrl(items: CartItem[], checkout?: CheckoutData, shipping?: ShippingEstimate | null) {
  const message = encodeURIComponent(buildWhatsAppMessage(items, checkout, shipping));
  return `https://wa.me/${brand.whatsappNumber}?text=${message}`;
}
