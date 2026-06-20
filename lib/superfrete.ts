import { shippingMessage } from "@/lib/shipping";
import type { ShippingEstimate, ShippingOption } from "@/types/shipping";

const superFreteUrl = "https://api.superfrete.com/api/v0/calculator";
const originCep = process.env.SUPERFRETE_ORIGIN_CEP?.trim() || "04257245";

type SuperFreteOption = {
  id?: number | string;
  name?: string;
  price?: string;
  custom_price?: string;
  delivery_time?: number;
  error?: string;
};

export function cleanCep(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

function getPrice(option: SuperFreteOption) {
  return Number(option.custom_price || option.price || 0);
}

export async function calculateShippingWithSuperFrete(destinationCep: string) {
  const rawToken = process.env.SUPERFRETE_TOKEN?.trim();
  const token = rawToken?.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw new Error("SUPERFRETE_TOKEN não configurado.");
  }

  const response = await fetch(superFreteUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "Desapego Soares (leonardosantana803@icloud.com)",
      accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from: { postal_code: cleanCep(originCep) },
      to: { postal_code: destinationCep },
      services: "1,2,17",
      options: {
        own_hand: false,
        receipt: false,
        insurance_value: 0,
        use_insurance_value: false
      },
      package: {
        weight: 1,
        length: 20,
        width: 20,
        height: 20
      }
    }),
    cache: "no-store"
  });

  const responseText = await response.text();
  let data: SuperFreteOption[] | Record<string, unknown> | null = null;

  try {
    data = responseText ? (JSON.parse(responseText) as SuperFreteOption[] | Record<string, unknown>) : null;
  } catch {
    data = null;
  }

  if (!response.ok || !Array.isArray(data)) {
    throw new Error("Não foi possível consultar o SuperFrete.");
  }

  const options = data
    .map((option, index) => {
      const service = option.name?.trim();
      const price = getPrice(option);
      const deliveryTime = Number(option.delivery_time || 0);

      if (!service || option.error || price <= 0 || deliveryTime <= 0) return null;

      return {
        id: String(option.id ?? `${service}-${index}`),
        service,
        price,
        deliveryTime,
        destinationCep,
        source: "superfrete" as const
      };
    })
    .filter(Boolean) as ShippingOption[];

  if (!options.length) {
    throw new Error("Nenhuma modalidade de frete disponível para este CEP.");
  }

  return {
    cep: destinationCep,
    options,
    message: shippingMessage,
    calculatedAt: new Date().toISOString()
  } satisfies ShippingEstimate;
}
