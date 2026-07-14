import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import { calculateBestInstallment } from "@/lib/installments";
import { getProductSale } from "@/lib/product-pricing";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const bestInstallment = calculateBestInstallment(product.price);
  const unavailable = product.sold_out || product.stock_quantity <= 0;
  const sale = getProductSale(product);

  return (
    <article className="group mx-auto flex h-full w-[94%] flex-col overflow-hidden rounded-md border border-neutral-200 bg-white transition hover:border-brand hover:shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
      <Link href={`/produto/${product.slug}`} className="relative block overflow-hidden bg-neutral-100">
        {unavailable ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold uppercase text-white">
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
              unavailable ? "opacity-60 grayscale" : ""
            }`}
            unoptimized={product.images[0]?.startsWith("data:")}
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1 bg-white px-3 pb-3 pt-2">
        <div className="flex min-h-3 items-center justify-between gap-3 text-[11px] font-semibold uppercase">
          <span className="text-brand">{product.category}</span>
          {unavailable ? <span className="text-red-600">Esgotado</span> : product.featured ? <span className="text-neutral-500">Destaque</span> : null}
        </div>
        <Link href={`/produto/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-8 text-sm font-bold leading-5 text-neutral-950 transition group-hover:text-brand">
            {product.name}
          </h3>
        </Link>
        <p className="min-h-3 truncate text-xs font-normal uppercase text-neutral-500">{product.brand || "Marca"}</p>
        {product.sizes.length ? (
          <p className="min-h-3 text-xs font-normal text-neutral-600">Tamanhos: {product.sizes.join(", ")}</p>
        ) : null}
        <div className="mt-auto grid gap-0.5">
          {sale ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-400 line-through">{formatPrice(sale.compareAtPrice)}</span>
              <span className="rounded-full bg-brand-mist px-2 py-0.5 text-[10px] font-semibold uppercase text-brand">
                {sale.percentOff}% OFF
              </span>
            </div>
          ) : null}
          <p className="text-lg font-bold text-neutral-950">{formatPrice(product.price)}</p>
        </div>
        <p className="text-[11px] font-normal leading-4 text-neutral-500">
          ou {bestInstallment.label} de {bestInstallment.formattedInstallmentAmount}
        </p>
        {unavailable ? <p className="text-xs font-normal uppercase text-red-600">Produto indisponível para compra</p> : null}
        <Button href={`/produto/${product.slug}`} variant="secondary" className="mt-1 w-full">
          Ver produto
        </Button>
      </div>
    </article>
  );
}
