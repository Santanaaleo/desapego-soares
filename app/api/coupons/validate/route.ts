import { NextResponse } from "next/server";
import { validateActiveCoupon } from "@/lib/supabase/coupons";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string; subtotal?: number };
    const coupon = await validateActiveCoupon(body.code ?? "", Number(body.subtotal));

    if (!coupon) {
      return NextResponse.json({ error: "Cupom inválido ou expirado." }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    const message = error instanceof Error && error.message === "Cupom esgotado." ? error.message : "Cupom inválido ou expirado.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
