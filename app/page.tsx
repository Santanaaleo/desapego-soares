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
  Óculos: "/produtos/categorias/oculos-transparente.png"
};

const categoryImageFit: Record<ProductCategory, string> = {
  Camisas: "object-contain object-center scale-[1.2] group-hover:scale-[1.23]",
  Polos: "object-contain object-center scale-[1.05] group-hover:scale-[1.08]",
  Bonés: "object-contain object-center scale-[1.06] group-hover:scale-[1.09]",
  Tênis: "object-contain object-center scale-[1.1] group-hover:scale-[1.13]",
  Óculos: "object-contain object-center scale-[1.1] group-hover:scale-[1.13]"
};

export default function Home() {
  return (
    <div className="bg-white">
      <section className="border-b border-neutral-200 bg-white md:bg-[linear-gradient(90deg,#000000_0%,#000000_45%,rgba(0,0,0,0.95)_58%,rgba(0,0,0,0.75)_70%,rgba(0,0,0,0.45)_82%,rgba(0,0,0,0.12)_94%,rgba(0,0,0,0)_100%)]">
        <Container className="grid gap-0 py-0 md:h-[420px] md:max-h-[460px] md:grid-cols-[minmax(0,1fr)_500px] lg:grid-cols-[minmax(0,1fr)_580px]">
          <div className="-mx-4 grid content-center bg-[linear-gradient(180deg,#0a0a0a_0%,#0a0a0a_86%,rgba(10,10,10,0)_100%)] px-4 py-5 text-white sm:-mx-6 sm:px-6 sm:py-7 md:mx-0 md:max-w-3xl md:bg-transparent md:px-0 md:py-10 lg:py-12">
            <p className="text-[11px] font-black uppercase text-white/80 sm:text-xs">Desapego Soares</p>
            <h1 className="mt-2 max-w-2xl font-display text-[28px] font-black uppercase leading-[0.98] sm:text-[34px] md:text-[46px] md:leading-[1.02] lg:text-[52px]">
              Produtos originais para quem vive o corre
            </h1>
            <p className="mt-2.5 max-w-xl text-[13px] font-bold leading-5 text-white/85 sm:mt-3 sm:text-base sm:leading-6">
              Confira as peças disponíveis e chame no WhatsApp para fechar seu pedido.
            </p>
            <div className="mt-3.5 flex flex-col gap-3 sm:mt-5 sm:flex-row">
              <Button href="/catalogo" className="h-10 gap-2 px-4 text-xs sm:h-11 sm:px-5 sm:text-sm">
                Ver catálogo <ArrowRight size={17} />
              </Button>
            </div>
          </div>

          <div className="flex h-[285px] items-center justify-center overflow-hidden bg-white py-2.5 sm:h-[330px] sm:py-4 md:z-10 md:h-full md:justify-end md:bg-transparent md:py-0">
            <Image
              src="/logos/hero-personagem-logo-upscale.png"
              alt="Logo principal DESAPEGO SOARES"
              width={375}
              height={666}
              priority
              sizes="(min-width: 1024px) 580px, (min-width: 768px) 500px, 100vw"
              className="h-[470px] w-auto max-w-none object-contain object-center sm:h-[575px] md:h-[680px] lg:h-[730px]"
            />
          </div>
        </Container>
      </section>

      <section className="border-b border-neutral-200 py-3 sm:py-4">
        <Container>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-black uppercase text-neutral-950 sm:text-lg">Destaques</h2>
            <Link href="/catalogo" className="text-xs font-black uppercase text-brand hover:text-neutral-950">
              Ver tudo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
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
              <p className="text-xs font-black uppercase text-brand">Disponíveis agora</p>
              <h2 className="mt-1 font-display text-xl font-black uppercase text-neutral-950 sm:text-2xl">
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
