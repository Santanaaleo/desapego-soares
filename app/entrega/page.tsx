"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/formatters";
import { formatShippingOption, shippingMessage, storeShippingEstimate } from "@/lib/shipping";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { CheckoutData } from "@/types/checkout";
import type { ShippingEstimate } from "@/types/shipping";

type ViaCepResponse = {
  erro?: boolean;
  localidade?: string;
  uf?: string;
  bairro?: string;
  logradouro?: string;
};

const initialForm: CheckoutData = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  cep: "",
  city: "",
  state: "",
  neighborhood: "",
  street: "",
  number: "",
  complement: "",
  document: "",
  coupon: ""
};

function isShippingEstimate(value: ShippingEstimate | { error?: string }): value is ShippingEstimate {
  return "cep" in value && "options" in value && Array.isArray(value.options);
}

export default function EntregaPage() {
  const { items, total } = useCart();
  const [form, setForm] = useState(initialForm);
  const [cepStatus, setCepStatus] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [shipping, setShipping] = useState<ShippingEstimate | null>(null);

  const selectedShipping = useMemo(
    () => shipping?.options.find((option) => option.service === shipping.selectedService) ?? null,
    [shipping]
  );
  const finalTotal = total + (selectedShipping?.price ?? 0);

  function updateField(field: keyof CheckoutData, value: string) {
    setForm((current) => ({ ...current, [field]: value }));

    if (field === "cep") {
      setShipping(null);
      setShippingError("");
      setSubmitError("");
    }
  }

  async function calculateShipping(cep: string) {
    setLoadingShipping(true);
    setShippingError("");
    setShipping(null);

    try {
      const response = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep })
      });
      const data = (await response.json()) as ShippingEstimate | { error?: string };

      if (!response.ok || !isShippingEstimate(data)) {
        setShippingError(("error" in data && data.error) || "Não foi possível consultar o frete agora.");
        return;
      }

      const estimate = { ...data, selectedService: undefined };
      setShipping(estimate);
      storeShippingEstimate(estimate);
    } catch {
      setShippingError("Não foi possível consultar o frete agora.");
    } finally {
      setLoadingShipping(false);
    }
  }

  async function fetchCep() {
    const cep = form.cep.replace(/\D/g, "");

    if (cep.length !== 8) {
      setCepStatus("Informe um CEP com 8 números.");
      setShipping(null);
      return;
    }

    setLoadingCep(true);
    setCepStatus("");
    setShippingError("");

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = (await response.json()) as ViaCepResponse;

      if (!response.ok || data.erro) {
        setCepStatus("CEP não encontrado.");
        setShipping(null);
        return;
      }

      setForm((current) => ({
        ...current,
        cep,
        city: data.localidade || current.city,
        state: data.uf || current.state,
        neighborhood: data.bairro || current.neighborhood,
        street: data.logradouro || current.street
      }));
      setCepStatus("Endereço preenchido pelo CEP.");
      await calculateShipping(cep);
    } catch {
      setCepStatus("Não foi possível consultar o CEP agora.");
      setShipping(null);
    } finally {
      setLoadingCep(false);
    }
  }

  function selectShipping(service: string) {
    if (!shipping) return;

    const nextShipping = { ...shipping, selectedService: service };
    setShipping(nextShipping);
    storeShippingEstimate(nextShipping);
    setSubmitError("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();

    if (!items.length) return;

    if (!selectedShipping || !shipping) {
      setSubmitError("Escolha uma forma de entrega antes de finalizar.");
      return;
    }

    window.open(buildWhatsAppUrl(items, form, shipping), "_blank", "noopener,noreferrer");
  }

  return (
    <section className="py-6 sm:py-8">
      <Container>
        <div className="mb-5">
          <p className="text-xs font-black uppercase text-brand">Entrega</p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase leading-none text-neutral-950 sm:text-4xl">
            Dados para finalizar
          </h1>
        </div>

        {!items.length ? (
          <div className="rounded-md border border-dashed border-neutral-300 p-10 text-center">
            <p className="font-bold text-neutral-700">Sua sacola está vazia.</p>
            <Button href="/catalogo" className="mt-5">
              Ver catálogo
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-5">
              <div className="rounded-md border border-neutral-200 bg-white p-5">
                <h2 className="font-display text-xl font-black uppercase text-neutral-950">Cliente</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input required value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} placeholder="Nome" />
                  <Input required value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} placeholder="Sobrenome" />
                  <Input required value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="Telefone" />
                  <Input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="E-mail" />
                </div>
              </div>

              <div className="rounded-md border border-neutral-200 bg-white p-5">
                <h2 className="font-display text-xl font-black uppercase text-neutral-950">Endereço</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Input required value={form.cep} onChange={(event) => updateField("cep", event.target.value)} placeholder="CEP" />
                    {cepStatus ? <p className="mt-2 text-xs font-bold text-neutral-500">{cepStatus}</p> : null}
                  </div>
                  <Button type="button" variant="secondary" onClick={fetchCep} disabled={loadingCep || loadingShipping}>
                    {loadingCep || loadingShipping ? "Consultando..." : "Buscar CEP e frete"}
                  </Button>
                  <Input required value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="Cidade" />
                  <Input required value={form.state} onChange={(event) => updateField("state", event.target.value)} placeholder="Estado" />
                  <Input required value={form.neighborhood} onChange={(event) => updateField("neighborhood", event.target.value)} placeholder="Bairro" />
                  <Input required value={form.street} onChange={(event) => updateField("street", event.target.value)} placeholder="Rua" />
                  <Input required value={form.number} onChange={(event) => updateField("number", event.target.value)} placeholder="Número" />
                  <Input value={form.complement} onChange={(event) => updateField("complement", event.target.value)} placeholder="Complemento" />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-md border border-neutral-200 bg-white p-5">
                  <h2 className="font-display text-xl font-black uppercase text-neutral-950">Nota fiscal</h2>
                  <Input required className="mt-4" value={form.document} onChange={(event) => updateField("document", event.target.value)} placeholder="CPF ou CNPJ" />
                </div>
                <div className="rounded-md border border-neutral-200 bg-white p-5">
                  <h2 className="font-display text-xl font-black uppercase text-neutral-950">Cupom</h2>
                  <Input className="mt-4" value={form.coupon} onChange={(event) => updateField("coupon", event.target.value)} placeholder="Código promocional" />
                </div>
              </div>

              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-5">
                <h2 className="font-display text-xl font-black uppercase text-neutral-950">Frete</h2>
                {loadingShipping ? <p className="mt-4 text-sm font-semibold text-neutral-600">Calculando opções...</p> : null}
                {shippingError ? <p className="mt-4 text-sm font-semibold text-red-600">{shippingError}</p> : null}
                {!loadingShipping && !shipping && !shippingError ? (
                  <p className="mt-4 text-sm text-neutral-600">Informe o CEP e clique em “Buscar CEP e frete”.</p>
                ) : null}
                {shipping ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {shipping.options.map((option) => {
                      const selected = option.service === shipping.selectedService;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => selectShipping(option.service)}
                          className={`rounded-md border bg-white p-4 text-left transition ${
                            selected ? "border-brand ring-1 ring-brand" : "border-neutral-200 hover:border-brand"
                          }`}
                        >
                          <p className="font-black uppercase text-neutral-950">{option.service}</p>
                          <p className="mt-1 text-sm font-bold text-neutral-500">{formatShippingOption(option)}</p>
                        </button>
                      );
                    })}
                    <p className="text-xs font-bold text-neutral-500 sm:col-span-2">{shippingMessage}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <aside className="h-fit rounded-md border border-neutral-200 bg-neutral-50 p-5">
              <h2 className="font-display text-xl font-black uppercase text-neutral-950">Resumo</h2>
              <div className="mt-4 grid gap-2 text-sm text-neutral-700">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex justify-between gap-3">
                    <span>
                      {item.quantity}x {item.product.name}
                      {item.size ? ` · ${item.size}` : ""}
                    </span>
                    <strong>{formatPrice(item.product.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3 border-t border-neutral-200 pt-5">
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-neutral-700">Subtotal</span>
                  <span className="font-semibold text-neutral-950">{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-neutral-700">
                    {selectedShipping ? `Frete ${selectedShipping.service}` : "Frete"}
                  </span>
                  <span className="font-semibold text-neutral-950">
                    {selectedShipping ? formatPrice(selectedShipping.price) : "A escolher"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
                  <span className="font-black uppercase text-neutral-700">Total</span>
                  <span className="font-display text-2xl font-black text-brand">{formatPrice(finalTotal)}</span>
                </div>
              </div>
              {submitError ? <p className="mt-4 text-sm font-semibold text-red-600">{submitError}</p> : null}
              <Button type="submit" className="mt-6 w-full gap-2">
                <MessageCircle size={18} />
                Finalizar no WhatsApp
              </Button>
              <Link href="/carrinho" className="mt-4 inline-block text-sm font-bold text-brand hover:text-brand-secondary">
                Voltar para sacola
              </Link>
            </aside>
          </form>
        )}
      </Container>
    </section>
  );
}
