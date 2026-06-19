import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-server";
import { uploadProductImage } from "@/lib/supabase/storage";

export async function POST(request: Request) {
  await requireAdmin("/admin");

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Envie uma imagem válida." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "O arquivo precisa ser uma imagem." }, { status: 400 });
    }

    const url = await uploadProductImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível enviar a imagem.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
