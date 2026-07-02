import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-server";
import { deleteCouponForAdmin, updateCouponForAdmin } from "@/lib/supabase/coupons";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  await requireAdmin("/admin/cupons");

  try {
    const body = (await request.json()) as { code?: string; discountPercent?: number; active?: boolean };
    const coupon = await updateCouponForAdmin(id, {
      code: body.code ?? "",
      discountPercent: Number(body.discountPercent),
      active: Boolean(body.active)
    });
    return NextResponse.json(coupon);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível atualizar o cupom.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await requireAdmin("/admin/cupons");

  try {
    await deleteCouponForAdmin(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin:coupons] Falha ao excluir cupom:", error);
    return NextResponse.json({ message: "Não foi possível excluir o cupom." }, { status: 500 });
  }
}
