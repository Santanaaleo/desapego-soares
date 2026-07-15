import { supabase } from "./client";
import { supabaseAdmin } from "./server";
import { sortProductsWithSoldOutLast } from "@/lib/products";
import type { Product, ProductInput } from "@/types/product";

const table = "products";

type ProductWriteInput = ProductInput | Partial<Product>;

function getSupabaseOrigin() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").origin;
  } catch {
    return "";
  }
}

function hasExpectedImageSignature(bytes: Uint8Array, contentType: string) {
  if (contentType === "image/png") {
    return bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }

  if (contentType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (contentType === "image/webp") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "RIFF" &&
      String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === "WEBP"
    );
  }

  return false;
}

async function validateProductImagesAvailability(images: string[]) {
  await Promise.all(
    images.map(async (image, index) => {
      if (image.startsWith("/")) return;

      let response: Response;

      try {
        response = await fetch(image, { cache: "no-store" });
      } catch {
        throw new Error(`A imagem ${index + 1} não pôde ser acessada.`);
      }

      const contentType = (response.headers.get("content-type") || "").split(";", 1)[0].toLowerCase();
      const bytes = new Uint8Array(await response.arrayBuffer());

      if (!response.ok || !contentType.startsWith("image/") || !bytes.length || !hasExpectedImageSignature(bytes, contentType)) {
        throw new Error(`A imagem ${index + 1} não é uma URL pública válida ou o arquivo não existe no Storage.`);
      }
    })
  );
}

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

  if ("stock_quantity" in input && (!Number.isInteger(Number(input.stock_quantity)) || Number(input.stock_quantity) < 0)) {
    return "Informe uma quantidade em estoque igual ou maior que zero.";
  }

  if (
    "compare_at_price" in input &&
    input.compare_at_price !== null &&
    input.compare_at_price !== undefined &&
    (!Number.isFinite(Number(input.compare_at_price)) || Number(input.compare_at_price) <= 0)
  ) {
    return "Informe um preço antigo maior que zero ou deixe o campo vazio.";
  }

  if ("images" in input) {
    if (!Array.isArray(input.images) || input.images.length === 0) {
      return "Envie pelo menos uma imagem do produto.";
    }

    const normalizedImages = input.images.map((image) => typeof image === "string" ? image.trim() : "");
    const hasDuplicates = new Set(normalizedImages).size !== normalizedImages.length;
    const supabaseOrigin = getSupabaseOrigin();
    const invalidImage = normalizedImages.some((image) => {
      if (!image) return true;
      if (image.startsWith("/")) {
        return image !== image.toLowerCase() || image.includes("..") || image.startsWith("//");
      }

      try {
        const url = new URL(image);
        return (
          url.protocol !== "https:" ||
          url.origin !== supabaseOrigin ||
          !url.pathname.startsWith("/storage/v1/object/public/product-images/products/") ||
          Boolean(url.search || url.hash || url.username || url.password)
        );
      } catch {
        return true;
      }
    });

    if (invalidImage || hasDuplicates) {
      return "Use imagens locais com caminho minúsculo ou URLs públicas válidas do Supabase Storage.";
    }
  }

  if (
    "size_options" in input &&
    (!Array.isArray(input.size_options) || input.size_options.some((size) => typeof size !== "string" || !size.trim()))
  ) {
    return "Informe uma grade de tamanhos válida.";
  }

  return null;
}

function normalizeProductInput<T extends ProductWriteInput>(input: T) {
  const stockQuantity = "stock_quantity" in input ? Number(input.stock_quantity) : undefined;
  const compareAtPrice =
    "compare_at_price" in input && input.compare_at_price !== null && input.compare_at_price !== undefined
      ? Math.round(Number(input.compare_at_price) * 100) / 100
      : input.compare_at_price;

  return {
    ...input,
    ...("images" in input ? { images: (input.images ?? []).map((image) => image.trim()) } : {}),
    ...("sizes" in input ? { sizes: Array.from(new Set((input.sizes ?? []).map((size) => size.trim()).filter(Boolean))) } : {}),
    ...("size_options" in input
      ? { size_options: Array.from(new Set((input.size_options ?? []).map((size) => size.trim()).filter(Boolean))) }
      : {}),
    ...("compare_at_price" in input ? { compare_at_price: compareAtPrice ?? null } : {}),
    ...(stockQuantity !== undefined
      ? {
          stock_quantity: stockQuantity,
          sold_out: stockQuantity === 0 ? true : input.sold_out ?? false
        }
      : {})
  };
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
  return sortProductsWithSoldOutLast(data as Product[]);
}

export async function getActiveProductBySlug(slug: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
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
  await validateProductImagesAvailability(input.images);

  const { data, error } = await supabaseAdmin.from(table).insert(normalizeProductInput(input)).select().single();
  if (error) throw friendlyProductError(error);
  return data as Product;
}

export async function updateProduct(id: string, input: ProductInput) {
  if (!supabaseAdmin) return null;

  const validationError = validateProductInput(input);
  if (validationError) throw new Error(validationError);
  await validateProductImagesAvailability(input.images);

  const { data, error } = await supabaseAdmin
    .from(table)
    .update({ ...normalizeProductInput(input), updated_at: new Date().toISOString() })
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
  if (input.images) await validateProductImagesAvailability(input.images);

  const { data, error } = await supabaseAdmin
    .from(table)
    .update({ ...normalizeProductInput(input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw friendlyProductError(error);
  return data as Product;
}
