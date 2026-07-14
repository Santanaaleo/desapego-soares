export type ProductCategory = "Camisas" | "Polos" | "Moletons" | "Shorts" | "Bonés" | "Tênis" | "Óculos" | "Perfumes" | "Calças";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  sale_active: boolean;
  category: ProductCategory;
  brand: string;
  sizes: string[];
  variations: string[];
  condition: string;
  featured: boolean;
  active: boolean;
  sold_out: boolean;
  stock_quantity: number;
  images: string[];
  created_at: string;
  updated_at: string;
};

export type ProductInput = Omit<Product, "id" | "created_at" | "updated_at">;
