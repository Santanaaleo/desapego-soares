export type ProductCategory = "Camisas" | "Polos" | "Moletons" | "Shorts" | "Bonés" | "Tênis" | "Óculos" | "Perfumes";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: ProductCategory;
  brand: string;
  sizes: string[];
  condition: string;
  featured: boolean;
  active: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
};

export type ProductInput = Omit<Product, "id" | "created_at" | "updated_at">;
