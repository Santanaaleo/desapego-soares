import { NextResponse } from "next/server";
import { calculateShippingWithSuperFrete, cleanCep } from "@/lib/superfrete";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Rota de frete ativa"
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { cep?: string } | null;
  const destinationCep = cleanCep(body?.cep);

  if (destinationCep.length !== 8) {
    return NextResponse.json({ error: "Informe um CEP com 8 números." }, { status: 400 });
  }

  try {
    return NextResponse.json(await calculateShippingWithSuperFrete(destinationCep));
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
