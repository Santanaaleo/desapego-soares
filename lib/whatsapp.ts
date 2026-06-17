import { brand } from "@/lib/constants";
import { formatPrice } from "@/lib/formatters";
import type { CartItem } from "@/types/cart";
import type { CheckoutData } from "@/types/checkout";

export function buildWhatsAppMessage(items: CartItem[], checkout?: CheckoutData) {
  const lines = items.map((item) => {
    const total = item.product.price * item.quantity;
    return [
      `${item.quantity}x ${item.product.name}`,
      item.size ? `Tamanho: ${item.size}` : null,
      `Valor: ${formatPrice(total)}`
    ].filter(Boolean).join("\n");
  });

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const checkoutLines = checkout
    ? [
        "",
        "Cliente:",
        `${checkout.firstName} ${checkout.lastName}`,
        `Telefone: ${checkout.phone}`,
        `E-mail: ${checkout.email}`,
        "",
        "Entrega:",
        `CEP: ${checkout.cep}`,
        `Cidade/UF: ${checkout.city} - ${checkout.state}`,
        `Bairro: ${checkout.neighborhood}`,
        `Rua: ${checkout.street}`,
        `Número: ${checkout.number}`,
        `Complemento: ${checkout.complement || "Não informado"}`,
        "",
        "Nota fiscal:",
        `CPF/CNPJ: ${checkout.document}`,
        "",
        "Cupom:",
        `Código promocional: ${checkout.coupon || "Não informado"}`,
        "",
        "Frete:",
        "PAC/SEDEX: calcular no atendimento."
      ]
    : [];

  return [
    "Olá.",
    "",
    "Tenho interesse nos seguintes produtos:",
    "",
    lines.join("\n\n"),
    "",
    `Total estimado: ${formatPrice(total)}`,
    ...checkoutLines,
    "",
    "Pode me passar disponibilidade e formas de envio?"
  ].join("\n");
}

export function buildWhatsAppUrl(items: CartItem[], checkout?: CheckoutData) {
  const message = encodeURIComponent(buildWhatsAppMessage(items, checkout));
  return `https://wa.me/${brand.whatsappNumber}?text=${message}`;
}
