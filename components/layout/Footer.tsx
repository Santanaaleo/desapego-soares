import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/constants";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <Container className="py-7 text-sm text-neutral-600">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Image
              src="/logos/logo-oficial-header.png"
              alt={brand.name}
              width={270}
              height={94}
              className="h-14 w-auto object-contain"
            />
            <p className="mt-3 max-w-md">Produtos originais, moda urbana brasileira e atendimento direto pelo WhatsApp.</p>
          </div>
          <div className="flex items-center gap-5 sm:justify-end">
            <Link href="/catalogo" className="font-bold text-neutral-900 hover:text-brand">
              Catalogo
            </Link>
            <a
              href={`https://wa.me/${brand.whatsappNumber}`}
              className="font-bold text-neutral-900 hover:text-brand"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <span className="font-bold text-neutral-900">{brand.instagram}</span>
          </div>
        </div>
        <p className="mt-6 border-t border-neutral-100 pt-4 text-center text-xs text-neutral-400">
          Desenvolvido por <span className="font-medium text-neutral-500">Santana Web Studio</span>
        </p>
      </Container>
    </footer>
  );
}
