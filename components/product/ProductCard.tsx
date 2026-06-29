import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import { calculateBestInstallment } from "@/lib/installments";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const bestInstallment = calculateBestInstallment(product.price);

  return (
    <article className="group mx-auto flex h-full w-[94%] flex-col overflow-hidden rounded-md border border-neutral-200 bg-white transition hover:border-brand hover:shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
      <Link href={`/produto/${product.slug}`} className="relative block overflow-hidden bg-neutral-100">
        {product.sold_out ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-neutral-950 px-3 py-1 text-xs font-black uppercase text-white">
            Esgotado
          </span>
        ) : null}
        <div className="flex h-64 w-full items-center justify-center overflow-hidden bg-neutral-100 md:h-72 lg:h-80">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={290}
            height={290}
            sizes="(min-width: 768px) 33vw, 50vw"
            className={`h-[220px] w-[220px] object-contain object-center transition duration-300 sm:h-[260px] sm:w-[260px] md:h-[290px] md:w-[290px] ${
              product.sold_out ? "opacity-60 grayscale" : ""
            }`}
            unoptimized={product.images[0]?.startsWith("data:")}
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1 bg-white px-3 pb-3 pt-2">
        <div className="flex min-h-3 items-center justify-between gap-3 text-[11px] font-semibold uppercase">
          <span className="text-brand">{product.category}</span>
          {product.sold_out ? <span className="text-red-600">Esgotado</span> : product.featured ? <span className="text-neutral-500">Destaque</span> : null}
        </div>
        <Link href={`/produto/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-8 text-sm font-medium leading-5 text-neutral-950 transition group-hover:text-brand">
            {product.name}
          </h3>
        </Link>
        <p className="min-h-3 truncate text-xs font-medium uppercase text-neutral-500">{product.brand || "Marca"}</p>
        {product.sizes.length ? (
          <p className="min-h-3 text-xs font-medium text-neutral-600">Tamanhos: {product.sizes.join(", ")}</p>
        ) : null}
        <p className="mt-auto text-lg font-extrabold text-neutral-950">{formatPrice(product.price)}</p>
        <p className="text-[11px] font-semibold leading-4 text-neutral-500">
          ou {bestInstallment.label} de {bestInstallment.formattedInstallmentAmount}
        </p>
        {product.sold_out ? <p className="text-xs font-bold uppercase text-red-600">Produto indisponível para compra</p> : null}
        <Button href={`/produto/${product.slug}`} variant="secondary" className="mt-1 w-full">
          Ver produto
        </Button>
      </div>
    </article>
  );
}
