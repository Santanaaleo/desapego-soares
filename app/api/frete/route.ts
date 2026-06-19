import { NextResponse } from "next/server";
import { shippingMessage } from "@/lib/shipping";
import type { ShippingEstimate, ShippingOption } from "@/types/shipping";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function cleanCep(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

function getPrice(option: SuperFreteOption) {
  return Number(option.custom_price || option.price || 0);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Rota de frete ativa"
  });
}

async function calculateWithSuperFrete(destinationCep: string) {
  const rawToken = process.env.SUPERFRETE_TOKEN?.trim();
  const token = rawToken?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json(
      { error: "A consulta de frete está temporariamente indisponível." },
      { status: 503 }
    );
  }

  const payload = {
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
  };

  const response = await fetch(superFreteUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "Desapego Soares (leonardosantana803@icloud.com)",
      accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify(payload),
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
    console.error("[frete] Falha na consulta ao provedor.");
    return NextResponse.json(
      { error: "Não foi possível consultar o SuperFrete. Tente novamente em instantes." },
      { status: response.status || 502 }
    );
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
    console.error("[frete] Nenhuma modalidade disponível.");
    return NextResponse.json({ error: "Nenhuma modalidade de frete disponível para este CEP." }, { status: 404 });
  }

  const estimate: ShippingEstimate = {
    cep: destinationCep,
    options,
    message: shippingMessage,
    calculatedAt: new Date().toISOString()
  };

  return NextResponse.json(estimate);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { cep?: string } | null;
  const destinationCep = cleanCep(body?.cep);

  if (destinationCep.length !== 8) {
    return NextResponse.json({ error: "Informe um CEP com 8 números." }, { status: 400 });
  }

  try {
    return await calculateWithSuperFrete(destinationCep);
  } catch (error) {
    console.error("[frete] Falha inesperada:", {
      message: error instanceof Error ? error.message : "Erro desconhecido"
    });
    return NextResponse.json(
      { error: "Erro ao consultar o SuperFrete. Tente novamente em instantes." },
      { status: 502 }
    );
  }
}
