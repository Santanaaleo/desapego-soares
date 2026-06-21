import type { ProductCategory } from "@/types/product";

export const categories: ProductCategory[] = ["Camisas", "Polos", "Bonés", "Tênis", "Óculos", "Moletons", "Perfumes"];

export const brand = {
  name: "DESAPEGO SOARES",
  instagram: "@desapegosoares",
  instagramUrl: "https://www.instagram.com/desapegos.soarees/",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511930071851"
};
