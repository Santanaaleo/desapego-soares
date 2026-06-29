"use client";

import Image from "next/image";
import Link from "next/link";
import { Edit, Star, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import type { Product } from "@/types/product";

type Props = {
  products: Product[];
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onToggleFeatured: (id: string) => void;
};

export function ProductTable({ products, onDelete, onToggleActive, onToggleFeatured }: Props) {
  return (
    <div className="overflow-hidden rounded-md border border-neutral-100 bg-white shadow-sm">
      {products.map((product) => (
        <div
          key={product.id}
          className="grid grid-cols-[72px_1fr] gap-4 border-b border-neutral-100 p-3 last:border-b-0 lg:grid-cols-[72px_1fr_auto]"
        >
          <div className="relative aspect-square overflow-hidden rounded-md bg-brand-mist">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="72px"
              className="object-cover"
              unoptimized={product.images[0]?.startsWith("data:")}
            />
          </div>
          <div>
            <p className="font-bold text-neutral-950">{product.name}</p>
            <p className="text-sm text-neutral-500">
              {product.category} · {formatPrice(product.price)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-black uppercase">
              <span className={product.active ? "text-brand" : "text-red-600"}>
                {product.active ? "Ativo" : "Inativo"}
              </span>
              {product.sold_out ? <span className="text-red-600">Esgotado</span> : null}
              {product.featured ? <span className="text-brand">Destaque</span> : null}
            </div>
          </div>
          <div className="col-span-2 flex flex-wrap gap-2 lg:col-span-1 lg:items-center">
            <button
              type="button"
              className="focus-ring rounded-md border border-neutral-200 px-3 py-2 text-xs font-black uppercase hover:border-brand hover:text-brand"
              onClick={() => onToggleActive(product.id)}
            >
              {product.active ? "Desativar" : "Ativar"}
            </button>
            <button
              type="button"
              className="focus-ring flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-2 text-xs font-black uppercase hover:border-brand hover:text-brand"
              onClick={() => onToggleFeatured(product.id)}
            >
              <Star size={14} />
              {product.featured ? "Remover destaque" : "Destaque"}
            </button>
            <Link
              href={`/admin/produtos/${product.id}/editar`}
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-full text-brand hover:bg-brand-mist"
              aria-label="Editar produto"
            >
              <Edit size={18} />
            </Link>
            <button
              type="button"
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
              onClick={() => {
                if (window.confirm("Excluir este produto?")) {
                  onDelete(product.id);
                }
              }}
              aria-label="Excluir produto"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
