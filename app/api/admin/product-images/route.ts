import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-server";
import { uploadProductImage } from "@/lib/supabase/storage";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const SUPPORTED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

function getExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() || "";
}

function getFileType(file: File) {
  if (file.type) {
    return file.type.toLowerCase();
  }

  const extension = getExtension(file);

  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return "";
}

export async function POST(request: Request) {
  await requireAdmin("/admin");

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Envie uma imagem válida." }, { status: 400 });
    }

    const fileType = getFileType(file);
    const extension = getExtension(file);

    if (!SUPPORTED_IMAGE_TYPES.includes(fileType) || !SUPPORTED_IMAGE_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { message: "Formato não suportado. Envie imagens jpg, jpeg, png ou webp." },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ message: "Imagem muito grande. Envie imagens com até 8 MB." }, { status: 413 });
    }

    const url = await uploadProductImage(file);
    const publicImage = await fetch(url, { cache: "no-store" });
    const contentType = publicImage.headers.get("content-type") || "";

    if (!publicImage.ok || !contentType.startsWith("image/")) {
      throw new Error("A imagem foi enviada, mas a URL pública do Storage não é válida.");
    }

    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível enviar a imagem.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
