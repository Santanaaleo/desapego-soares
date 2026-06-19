import { NextResponse } from "next/server";
import { listActiveProducts } from "@/lib/supabase/products";

export async function GET() {
  try {
    const products = await listActiveProducts();
    return NextResponse.json({ products: products ?? [] });
  } catch {
    return NextResponse.json({ message: "Não foi possível carregar os produtos." }, { status: 500 });
  }
}
