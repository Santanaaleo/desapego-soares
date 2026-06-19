import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-server";
import { deleteProduct, patchProduct, updateProduct } from "@/lib/supabase/products";
import type { Product, ProductInput } from "@/types/product";

type Params = {
  params: Promise<{ id: string }>;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Não foi possível processar a solicitação.";
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  await requireAdmin(`/admin/produtos/${id}/editar`);

  try {
    const input = (await request.json()) as ProductInput;
    const product = await updateProduct(id, input);

    if (!product) {
      return NextResponse.json({ message: "Supabase admin não configurado." }, { status: 503 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  await requireAdmin("/admin");

  try {
    const input = (await request.json()) as Partial<Product>;
    const product = await patchProduct(id, input);

    if (!product) {
      return NextResponse.json({ message: "Supabase admin não configurado." }, { status: 503 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await requireAdmin("/admin");

  try {
    const deleted = await deleteProduct(id);

    if (!deleted) {
      return NextResponse.json({ message: "Supabase admin não configurado." }, { status: 503 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  }
}
