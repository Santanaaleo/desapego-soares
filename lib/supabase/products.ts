import { supabase } from "./client";
import type { Product, ProductInput } from "@/types/product";

const table = "products";

export async function listProducts() {
  if (!supabase) return null;

  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Product[];
}

export async function createProduct(input: ProductInput) {
  if (!supabase) return null;

  const { data, error } = await supabase.from(table).insert(input).select().single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, input: ProductInput) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(table)
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string) {
  if (!supabase) return null;

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function patchProduct(id: string, input: Partial<Product>) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(table)
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}
