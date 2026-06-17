import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const imageFit =
    product.category === "Polos"
      ? "object-contain object-center p-1 transition duration-300 group-hover:scale-[1.01]"
      : "object-cover object-center transition duration-300 group-hover:scale-[1.03]";

  return (
    <article className="group mx-auto flex h-full w-[94%] flex-col overflow-hidden rounded-md border border-neutral-200 bg-white transition hover:border-brand hover:shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
      <Link href={`/produto/${product.slug}`} className="block overflow-hidden bg-neutral-100">
        <div className="relative h-64 w-full overflow-hidden bg-neutral-100 md:h-72 lg:h-80">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className={imageFit}
            unoptimized={product.images[0]?.startsWith("data:")}
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1 bg-white px-3 pb-3 pt-2">
        <div className="flex min-h-3 items-center justify-between gap-3 text-[11px] font-black uppercase">
          <span className="text-brand">{product.category}</span>
          {product.featured ? <span className="text-neutral-500">Destaque</span> : null}
        </div>
        <Link href={`/produto/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-8 text-sm font-medium leading-5 text-neutral-950 transition group-hover:text-brand">
            {product.name}
          </h3>
        </Link>
        <p className="min-h-3 truncate text-xs font-bold uppercase text-neutral-500">{product.brand || "Marca"}</p>
        {product.sizes.length ? (
          <p className="min-h-3 text-xs font-bold text-neutral-600">Tamanhos: {product.sizes.join(", ")}</p>
        ) : null}
        <p className="mt-auto text-lg font-black text-neutral-950">{formatPrice(product.price)}</p>
        <Button href={`/produto/${product.slug}`} variant="secondary" className="mt-1 w-full">
          Ver produto
        </Button>
      </div>
    </article>
  );
}
