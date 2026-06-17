import { supabase } from "./client";

export async function uploadProductImage(file: File) {
  if (!supabase) {
    throw new Error("Supabase não configurado.");
  }

  const path = `products/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
