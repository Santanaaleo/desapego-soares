import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-server";
import { createCouponForAdmin, listCouponsForAdmin } from "@/lib/supabase/coupons";

export async function GET() {
  await requireAdmin("/admin/cupons");

  try {
    const coupons = await listCouponsForAdmin();
    return NextResponse.json(coupons ?? []);
  } catch (error) {
    console.error("[admin:coupons] Falha ao listar cupons:", error);
    return NextResponse.json({ message: "Não foi possível listar os cupons." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await requireAdmin("/admin/cupons");

  try {
    const body = (await request.json()) as { code?: string; discountPercent?: number; active?: boolean };
    const coupon = await createCouponForAdmin({
      code: body.code ?? "",
      discountPercent: Number(body.discountPercent),
      active: Boolean(body.active)
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível criar o cupom.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
