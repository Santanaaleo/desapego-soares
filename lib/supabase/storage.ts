import { supabaseAdmin } from "./server";

function sanitizeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const baseName = fileName
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${baseName || "imagem"}.${extension}`;
}

export async function uploadProductImage(file: File) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin não configurado.");
  }

  const path = `products/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabaseAdmin.storage.from("product-images").upload(path, file, {
    contentType: file.type || undefined,
    upsert: false
  });

  if (error) {
    throw new Error(`Erro ao salvar no storage: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
