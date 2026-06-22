import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/constants";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <Container className="py-9 text-sm text-neutral-600 sm:py-10">
        <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="text-center sm:text-left">
            <Image
              src="/logos/logo-oficial-header.png"
              alt={brand.name}
              width={270}
              height={94}
              className="mx-auto h-16 w-auto object-contain sm:mx-0"
            />
            <p className="mx-auto mt-4 max-w-md leading-6 sm:mx-0">Produtos originais, moda urbana brasileira e atendimento direto pelo WhatsApp.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs uppercase tracking-[0.12em] sm:justify-end">
            <Link href="/catalogo" className="font-semibold text-neutral-900 hover:text-brand">
              Catálogo
            </Link>
            <a
              href={`https://wa.me/${brand.whatsappNumber}`}
              className="font-semibold text-neutral-900 hover:text-brand"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <a
              href={brand.instagramUrl}
              className="font-semibold text-neutral-900 hover:text-brand"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>
        <p className="mt-8 border-t border-neutral-100 pt-5 text-center text-xs text-neutral-400">
          Desenvolvido por <span className="font-medium text-neutral-500">Santana Web Studio</span>
        </p>
      </Container>
    </footer>
  );
}
