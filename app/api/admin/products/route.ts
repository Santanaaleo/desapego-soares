import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-server";
import { createProduct, listProductsForAdmin } from "@/lib/supabase/products";
import type { ProductInput } from "@/types/product";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Não foi possível processar a solicitação.";
}

export async function GET() {
  await requireAdmin("/admin");

  const products = await listProductsForAdmin();
  return NextResponse.json({ products: products ?? [] });
}

export async function POST(request: Request) {
  await requireAdmin("/admin/produtos/novo");

  try {
    const input = (await request.json()) as ProductInput;
    const product = await createProduct(input);

    if (!product) {
      return NextResponse.json({ message: "Supabase admin não configurado." }, { status: 503 });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  }
}
