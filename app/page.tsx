import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryProductSections } from "@/components/product/CategoryProductSections";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { categories } from "@/lib/constants";
import type { ProductCategory } from "@/types/product";

const categoryCovers: Record<ProductCategory, string> = {
  Camisas: "/produtos/categorias/camisas.jpeg",
  Polos: "/produtos/categorias/polos-categoria.png",
  Bonés: "/produtos/categorias/bones-categoria.png",
  Tênis: "/produtos/categorias/tenis-categoria.png",
  Óculos: "/produtos/categorias/oculos-transparente.png",
  Perfumes: "/produtos/categorias/perfumes-categoria.png"
};

const categoryImageFit: Record<ProductCategory, string> = {
  Camisas: "object-contain object-center scale-[1.14] group-hover:scale-[1.17]",
  Polos: "object-contain object-center scale-[1.05] group-hover:scale-[1.08]",
  Bonés: "object-contain object-center scale-[1.06] group-hover:scale-[1.09]",
  Tênis: "object-contain object-center scale-[1.02] group-hover:scale-[1.05]",
  Óculos: "object-contain object-center scale-[1.02] group-hover:scale-[1.05]",
  Perfumes: "object-contain object-center scale-[0.92] group-hover:scale-[0.96]"
};

export default function Home() {
  return (
    <div className="bg-white">
      <section className="border-b border-neutral-900 bg-black">
        <Container className="grid gap-0 py-0 md:h-[430px] md:grid-cols-2">
          <div className="-mx-4 grid content-center bg-black px-4 py-5 text-white sm:-mx-6 sm:px-6 sm:py-7 md:mx-0 md:px-0 md:pr-10 md:py-10 lg:py-12">
            <p className="text-[11px] font-semibold uppercase text-white/80 sm:text-xs">Desapego Soares</p>
            <h1 className="mt-2 max-w-2xl font-display text-[28px] font-semibold uppercase leading-[0.98] tracking-[0.04em] sm:text-[34px] md:text-[46px] md:leading-[1.02] lg:text-[52px]">
              Produtos originais para quem vive o corre
            </h1>
            <p className="mt-2.5 max-w-xl text-[13px] font-medium leading-5 text-white/85 sm:mt-3 sm:text-base sm:leading-6">
              Confira as peças disponíveis e finalize com Pix ou cartão pelo checkout seguro.
            </p>
            <div className="mt-3.5 flex flex-col gap-3 sm:mt-5 sm:flex-row">
              <Button href="/catalogo" className="h-10 gap-2 px-4 text-xs sm:h-11 sm:px-5 sm:text-sm">
                Ver catálogo <ArrowRight size={17} />
              </Button>
            </div>
          </div>

          <div className="-mx-4 flex h-[295px] items-center justify-center overflow-hidden bg-black py-2 sm:-mx-6 sm:h-[340px] sm:py-3 md:mx-0 md:h-full md:justify-center md:px-6 md:py-0">
            <Image
              src="/logos/logo-principal-hero.jpeg"
              alt="Logo principal DESAPEGO SOARES"
              width={900}
              height={1600}
              priority
              quality={100}
              sizes="(min-width: 1024px) 520px, (min-width: 768px) 45vw, 100vw"
              className="h-[440px] w-auto max-w-none object-contain object-center sm:h-[520px] md:h-[610px] lg:h-[660px]"
            />
          </div>
        </Container>
      </section>

      <section className="border-b border-neutral-200 py-3 sm:py-4">
        <Container>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold uppercase text-neutral-950 sm:text-lg">Destaques</h2>
            <Link href="/catalogo" className="text-xs font-semibold uppercase text-brand hover:text-neutral-950">
              Ver tudo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => {
              return (
                <Link
                  key={category}
                  href={`/catalogo?categoria=${category}`}
                  className="group overflow-hidden rounded-md border border-neutral-200 bg-white text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                >
                  <span className="relative block h-24 overflow-hidden bg-neutral-100 sm:h-32">
                    <Image
                      src={categoryCovers[category]}
                      alt={category}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                      className={`transition duration-300 ${categoryImageFit[category]}`}
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                  </span>
                  <span className="block px-3 py-3 font-[Montserrat,Inter,Arial,sans-serif] text-sm font-medium tracking-normal text-neutral-950 sm:text-base">
                    {category}
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-5 sm:py-7">
        <Container>
          <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
            <div>
              <p className="text-xs font-semibold uppercase text-brand">Disponíveis agora</p>
              <h2 className="mt-1 font-display text-xl font-semibold uppercase text-neutral-950 sm:text-2xl">
                Produtos por categoria
              </h2>
            </div>
            <Button href="/catalogo" variant="ghost">
              Ver todos
            </Button>
          </div>
          <CategoryProductSections />
        </Container>
      </section>
    </div>
  );
}
