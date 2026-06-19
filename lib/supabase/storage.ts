import { supabaseAdmin } from "./server";

export async function uploadProductImage(file: File) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin não configurado.");
  }

  const path = `products/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabaseAdmin.storage.from("product-images").upload(path, file, {
    contentType: file.type || undefined,
    upsert: false
  });

  if (error) {
    throw error;
  }

  const { data } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
