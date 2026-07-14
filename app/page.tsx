import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CreditCard, MessageCircle, Truck } from "lucide-react";
import { CategoryProductSections } from "@/components/product/CategoryProductSections";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import type { ProductCategory } from "@/types/product";

function SecurePurchaseIcon({ size = 34, strokeWidth = 1.7 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M15 3.75L23.25 7.05V13.55C23.25 19.45 19.8 24.6 15 26.25C10.2 24.6 6.75 19.45 6.75 13.55V7.05L15 3.75Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.75 14.95L14.05 17.25L18.75 12.55"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const categoryCovers: Record<ProductCategory, string> = {
  Camisas: "/categories/camisas.jpg?v=2",
  Polos: "/categories/polos.png?v=2",
  Shorts: "/categories/shorts.png?v=2",
  Bonés: "/categories/bones.png?v=2",
  Tênis: "/categories/tenis.png?v=2",
  Óculos: "/categories/oculos.png?v=2",
  Moletons: "/categories/moletons.png?v=2",
  Perfumes: "/categories/perfumes.png?v=2",
  Calças: "/categories/calcas.png?v=2"
};

const categoryImageFit: Record<ProductCategory, string> = {
  Camisas: "object-contain object-center scale-[1.14] group-hover:scale-[1.17]",
  Polos: "object-contain object-center scale-[1.05] group-hover:scale-[1.08]",
  Shorts: "object-contain object-center scale-[0.92] group-hover:scale-[0.96]",
  Bonés: "object-contain object-center scale-[1.06] group-hover:scale-[1.09]",
  Tênis: "object-contain object-center scale-[1.02] group-hover:scale-[1.05]",
  Óculos: "object-contain object-center scale-[1.02] group-hover:scale-[1.05]",
  Moletons: "object-contain object-center scale-[1.05] group-hover:scale-[1.08]",
  Perfumes: "object-contain object-center scale-[0.92] group-hover:scale-[0.96]",
  Calças: "object-contain object-center scale-[0.96] group-hover:scale-[1.00]"
};

const homeCategoryOrder: ProductCategory[] = ["Camisas", "Polos", "Moletons", "Shorts", "Bonés", "Tênis", "Óculos", "Perfumes", "Calças"];

const benefits = [
  {
    title: "Compra segura",
    description: "Seus dados protegidos",
    icon: SecurePurchaseIcon
  },
  {
    title: "Pix ou cartão",
    description: "Checkout seguro via InfinitePay",
    icon: CreditCard
  },
  {
    title: "Entrega para todo Brasil",
    description: "PAC e SEDEX disponíveis",
    icon: Truck
  },
  {
    title: "Atendimento direto",
    description: "Suporte pelo WhatsApp",
    icon: MessageCircle
  }
];

export default function Home() {
  return (
    <div className="bg-white">
      <section className="border-b border-neutral-900 bg-black">
        <Container className="grid gap-0 py-0 md:h-[430px] md:grid-cols-2">
          <div className="-mx-4 grid content-center bg-black px-4 py-5 text-white sm:-mx-6 sm:px-6 sm:py-7 md:mx-0 md:px-0 md:pr-10 md:py-10 lg:py-12">
            <p className="text-[11px] font-semibold uppercase text-white/80 sm:text-xs">Desapego Soares</p>
            <h1 className="mt-2 max-w-2xl text-[28px] font-bold uppercase leading-[0.98] tracking-[0.04em] sm:text-[34px] md:text-[46px] md:leading-[1.02] lg:text-[52px]">
              Produtos originais para quem vive o corre
            </h1>
            <p className="mt-2.5 max-w-xl text-[13px] font-normal leading-5 text-white/85 sm:mt-3 sm:text-base sm:leading-6">
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
          <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
            <h2 className="min-w-0 text-base font-bold uppercase text-neutral-950 sm:text-lg">Destaques</h2>
            <Link href="/catalogo" className="flex-shrink-0 whitespace-nowrap text-xs font-semibold uppercase text-brand hover:text-neutral-950">
              Ver tudo
            </Link>
          </div>
          <div className="scrollbar-none flex max-w-full min-w-0 snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0 lg:grid-cols-9">
            {homeCategoryOrder.map((category) => {
              return (
                <Link
                  key={category}
                  href={{ pathname: "/catalogo", query: { categoria: category } }}
                  className="group w-[84%] max-w-[340px] flex-none snap-start overflow-hidden rounded-md border border-neutral-200 bg-white text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] sm:w-auto sm:max-w-none"
                >
                  <span className="relative block h-24 overflow-hidden bg-neutral-100 sm:h-32">
                    {/* Category covers are public static files; native img avoids optimizer differences in mobile Safari. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={categoryCovers[category]}
                      alt={category}
                      width="100%"
                      height="100%"
                      style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }}
                      className={`transition duration-300 ${categoryImageFit[category]}`}
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                  </span>
                  <span className="block px-3 py-3 text-sm font-semibold tracking-normal text-neutral-950 sm:text-base">
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
          <div className="mb-4 grid min-w-0 gap-1.5 sm:mb-5 sm:flex sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-brand">Disponíveis agora</p>
              <div className="mt-1 flex min-w-0 items-start justify-between gap-3 sm:block">
                <h2 className="min-w-0 text-[19px] font-bold uppercase leading-tight text-neutral-950 min-[375px]:text-xl sm:text-2xl">
                  Produtos por categoria
                </h2>
                <Button href="/catalogo" variant="ghost" className="h-auto flex-shrink-0 whitespace-nowrap px-0 py-1 text-xs sm:hidden">
                  Ver todos
                </Button>
              </div>
            </div>
            <Button href="/catalogo" variant="ghost" className="hidden flex-shrink-0 whitespace-nowrap sm:inline-flex">
              Ver todos
            </Button>
          </div>
          <CategoryProductSections />
        </Container>
      </section>

      <section className="bg-white py-12 sm:py-14 lg:py-16">
        <Container>
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-14">
            {benefits.map(({ title, description, icon: Icon }) => {
              return (
                <div key={title} className="text-center">
                  <div className="mb-5 flex justify-center text-brand">
                    <Icon size={34} strokeWidth={1.7} aria-hidden="true" />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-neutral-950">{title}</h2>
                  <p className="mt-2 text-sm font-normal leading-6 text-neutral-500">{description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </div>
  );
}
