import { NextResponse } from "next/server";
import { listActiveProducts } from "@/lib/supabase/products";

type SafeSupabaseError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function getSafeSupabaseError(error: unknown): SafeSupabaseError {
  if (error && typeof error === "object") {
    const safeError = error as SafeSupabaseError;

    return {
      message: safeError.message,
      code: safeError.code,
      details: safeError.details,
      hint: safeError.hint
    };
  }

  return {
    message: error instanceof Error ? error.message : "Erro desconhecido"
  };
}

export async function GET() {
  try {
    const products = await listActiveProducts();
    return NextResponse.json({ products: products ?? [] });
  } catch (error) {
    console.error("[api/products] Supabase error", getSafeSupabaseError(error));
    return NextResponse.json({ message: "Não foi possível carregar os produtos." }, { status: 500 });
  }
}
