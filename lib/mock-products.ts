import type { Product } from "@/types/product";

const now = new Date().toISOString();

export const mockProducts: Product[] = [
  {
    id: "polo-lacoste-verde",
    name: "Polo Lacoste Sport Verde",
    slug: "polo-lacoste-sport-verde",
    description:
      "Polo original Lacoste Sport em verde vibrante com microestampa, gola estruturada e acabamento premium.",
    price: 189.9,
    category: "Polos",
    brand: "Lacoste Sport",
    sizes: ["M", "G"],
    condition: "Original, seminova",
    featured: true,
    active: true,
    sold_out: false,
    images: [
      "/produtos/polos/polo-3.jpeg",
      "/produtos/polos/polo-1.jpeg",
      "/produtos/polos/polo-2.jpeg",
      "/produtos/polos/polo-4.jpeg"
    ],
    created_at: now,
    updated_at: now
  },
  {
    id: "polo-lacoste-azul",
    name: "Polo Lacoste Sport Azul",
    slug: "polo-lacoste-sport-azul",
    description:
      "Polo original Lacoste Sport azul com etiqueta, estampa discreta e visual esportivo para uso casual.",
    price: 209.9,
    category: "Polos",
    brand: "Lacoste Sport",
    sizes: ["P", "M"],
    condition: "Original, com etiqueta",
    featured: true,
    active: true,
    sold_out: false,
    images: [
      "/produtos/polos/polo-12.jpeg",
      "/produtos/polos/polo-9.jpeg",
      "/produtos/polos/polo-10.jpeg",
      "/produtos/polos/polo-11.jpeg"
    ],
    created_at: now,
    updated_at: now
  },
  {
    id: "polo-lacoste-verde-detalhes",
    name: "Polo Lacoste Verde Detalhada",
    slug: "polo-lacoste-verde-detalhada",
    description:
      "Modelo verde original com fotos de detalhe para conferir tecido, gola, logo aplicado e caimento.",
    price: 179.9,
    category: "Polos",
    brand: "Lacoste Sport",
    sizes: ["M"],
    condition: "Original, excelente estado",
    featured: false,
    active: true,
    sold_out: false,
    images: [
      "/produtos/polos/polo-5.jpeg",
      "/produtos/polos/polo-6.jpeg",
      "/produtos/polos/polo-7.jpeg",
      "/produtos/polos/polo-8.jpeg"
    ],
    created_at: now,
    updated_at: now
  }
];

export function getProducts() {
  return mockProducts.filter((product) => product.active);
}

export function getFeaturedProducts() {
  return getProducts().filter((product) => product.featured);
}

export function getProductBySlug(slug: string) {
  return getProducts().find((product) => product.slug === slug);
}
