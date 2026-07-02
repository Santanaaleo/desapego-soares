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
  } catch {
    return NextResponse.json({ error: "Cupom inválido ou expirado." }, { status: 400 });
  }
}
