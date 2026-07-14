import type { ProductCategory } from "@/types/product";

export const categories: ProductCategory[] = ["Camisas", "Polos", "Moletons", "Shorts", "Bonés", "Tênis", "Óculos", "Perfumes", "Calças"];

export const homeProductSectionCategories: ProductCategory[] = [
  "Camisas",
  "Polos",
  "Moletons",
  "Shorts",
  "Bonés",
  "Tênis",
  "Óculos",
  "Perfumes"
];

export const brand = {
  name: "DESAPEGO SOARES",
  instagram: "@desapegosoares",
  instagramUrl: "https://www.instagram.com/desapegos.soarees/",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511930071851"
};
