import type { ProductCategory } from "@/types/product";

export const categories: ProductCategory[] = ["Camisas", "Polos", "Bonés", "Tênis", "Óculos"];

export const brand = {
  name: "DESAPEGO SOARES",
  instagram: "@desapegosoares",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511930071851"
};
