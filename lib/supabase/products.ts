import { supabase } from "./client";
import { supabaseAdmin } from "./server";
import type { Product, ProductInput } from "@/types/product";

const table = "products";

type ProductWriteInput = ProductInput | Partial<Product>;

export function validateProductInput(input: ProductWriteInput) {
  if ("price" in input && (!Number.isFinite(input.price) || Number(input.price) <= 0)) {
    return "Informe um preço maior que zero.";
  }

  if ("name" in input && !input.name?.trim()) {
    return "Informe o nome do produto.";
  }

  if ("slug" in input && !input.slug?.trim()) {
    return "Informe um slug válido.";
  }

  return null;
}

function friendlyProductError(error: { code?: string; message?: string }) {
  if (error.code === "23505" || error.message?.toLowerCase().includes("duplicate")) {
    return new Error("Já existe um produto com este slug. Altere o nome do produto ou ajuste o slug.");
  }

  return error;
}

export async function listProducts() {
  if (!supabase) return null;

  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Product[];
}

export async function listProductsForAdmin() {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin.from(table).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Product[];
}

export async function listActiveProducts() {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Product[];
}

export async function getActiveProductBySlug(slug: string) {
  if (!supabase) return null;

  const { data, error } = await supabase.from(table).select("*").eq("slug", slug).eq("active", true).maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function listActiveProductSlugs() {
  if (!supabase) return null;

  const { data, error } = await supabase.from(table).select("slug").eq("active", true);
  if (error) throw error;
  return data as Pick<Product, "slug">[];
}

export async function createProduct(input: ProductInput) {
  if (!supabaseAdmin) return null;

  const validationError = validateProductInput(input);
  if (validationError) throw new Error(validationError);

  const { data, error } = await supabaseAdmin.from(table).insert(input).select().single();
  if (error) throw friendlyProductError(error);
  return data as Product;
}

export async function updateProduct(id: string, input: ProductInput) {
  if (!supabaseAdmin) return null;

  const validationError = validateProductInput(input);
  if (validationError) throw new Error(validationError);

  const { data, error } = await supabaseAdmin
    .from(table)
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw friendlyProductError(error);
  return data as Product;
}

export async function deleteProduct(id: string) {
  if (!supabaseAdmin) return null;

  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function patchProduct(id: string, input: Partial<Product>) {
  if (!supabaseAdmin) return null;

  const validationError = validateProductInput(input);
  if (validationError) throw new Error(validationError);

  const { data, error } = await supabaseAdmin
    .from(table)
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw friendlyProductError(error);
  return data as Product;
}
