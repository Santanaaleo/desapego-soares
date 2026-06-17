"use client";

import { Menu, Search, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Container } from "./Container";

const links = [
  { href: "/", label: "Home" },
  { href: "/catalogo", label: "Catálogo" }
];

const topMessages = ["SOMENTE PRODUTOS ORIGINAIS", "ENVIO PARA TODO BRASIL", "+300 ARTIGOS VENDIDOS"];

export function Header() {
  const [open, setOpen] = useState(false);
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const bagButton = (
    <span className="relative flex h-10 w-10 items-center justify-center rounded-md bg-brand text-white transition hover:bg-neutral-950 md:h-11 md:w-11">
      <ShoppingBag size={20} />
      {cartCount > 0 ? (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-neutral-950 px-1 text-[10px] font-black leading-none text-white ring-2 ring-white">
          {cartCount}
        </span>
      ) : null}
    </span>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="bg-neutral-950 text-white">
        <Container className="flex h-7 items-center gap-7 overflow-x-auto whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.16em] sm:h-8 sm:text-xs md:grid md:grid-cols-3 md:gap-4">
          {topMessages.map((message) => (
            <span key={message} className="shrink-0 text-center text-white/90">
              {message}
            </span>
          ))}
        </Container>
      </div>

      <Container className="grid gap-2 py-2 md:grid-cols-[230px_1fr_auto] md:items-center md:gap-3 md:py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="focus-ring flex items-center" aria-label="Desapego Soares">
            <Image
              src="/logos/logo-oficial-header.png"
              alt="Desapego Soares"
              width={270}
              height={94}
              priority
              className="h-10 w-[140px] object-contain object-left sm:h-14 sm:w-[190px] md:h-16 md:w-[220px]"
            />
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/carrinho"
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-md bg-brand text-white transition hover:bg-neutral-950 sm:h-10 sm:w-10"
              aria-label="Abrir sacola"
            >
              {bagButton}
            </Link>
            <button
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 text-neutral-950 transition hover:text-brand sm:h-10 sm:w-10"
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label="Abrir menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <Link
          href="/catalogo"
          className="focus-ring flex h-9 items-center gap-2 rounded-md border border-neutral-300 bg-neutral-50 px-3 text-xs font-bold text-neutral-500 transition hover:border-brand hover:bg-white hover:text-brand sm:h-11 sm:gap-3 sm:px-4 sm:text-sm"
        >
          <Search size={17} />
          Buscar produto, marca ou categoria
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          <nav className="flex items-center gap-5 text-sm font-black uppercase text-neutral-950">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-brand">
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/carrinho"
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-md bg-brand text-white transition hover:bg-neutral-950"
            aria-label="Abrir sacola"
          >
            {bagButton}
          </Link>
        </div>
      </Container>

      {open ? (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <Container className="grid gap-1 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-3 text-sm font-black uppercase text-neutral-950"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </Container>
        </div>
      ) : null}
    </header>
  );
}
