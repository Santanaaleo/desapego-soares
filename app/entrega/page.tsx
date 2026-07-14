"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { CreditCard } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCart } from "@/hooks/useCart";
import { useCoupon } from "@/hooks/useCoupon";
import { formatPrice } from "@/lib/formatters";
import { calculateInstallments } from "@/lib/installments";
import { getProductSale } from "@/lib/product-pricing";
import { formatShippingOption, shippingMessage, storeShippingEstimate } from "@/lib/shipping";
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
  document: ""
};

function isShippingEstimate(value: ShippingEstimate | { error?: string }): value is ShippingEstimate {
  return "cep" in value && "options" in value && Array.isArray(value.options);
}

export default function EntregaPage() {
  const { items, total } = useCart();
  const { coupon, code, setCode, loading: loadingCoupon, error: couponError, applyCoupon, removeCoupon } = useCoupon(total);
  const [form, setForm] = useState(initialForm);
  const [cepStatus, setCepStatus] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [shipping, setShipping] = useState<ShippingEstimate | null>(null);

  const selectedShipping = useMemo(
    () => shipping?.options.find((option) => option.service === shipping.selectedService) ?? null,
    [shipping]
  );
  const discountAmount = coupon?.discountAmount ?? 0;
  const discountedSubtotal = Math.max(0, total - discountAmount);
  const finalTotal = discountedSubtotal + (selectedShipping?.price ?? 0);
  const installments = calculateInstallments(finalTotal);
  const bestInstallment = installments[installments.length - 1];

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

  async function payOnline(event?: FormEvent) {
    event?.preventDefault();

    if (!items.length) return;

    if (!selectedShipping || !shipping) {
      setSubmitError("Escolha uma forma de entrega antes de pagar pelo site.");
      return;
    }

    setLoadingPayment(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/checkout/infinitepay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            size: item.size,
            variation: item.variation,
            quantity: item.quantity
          })),
          customer: {
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            email: form.email,
            document: form.document
          },
          address: {
            cep: form.cep,
            city: form.city,
            state: form.state,
            neighborhood: form.neighborhood,
            street: form.street,
            number: form.number,
            complement: form.complement
          },
          shipping: {
            service: selectedShipping.service,
            price: selectedShipping.price
          },
          couponCode: coupon?.code ?? null
        })
      });
      const data = (await response.json()) as { checkout_url?: string; link?: string; error?: string };

      if (!response.ok || (!data.checkout_url && !data.link)) {
        setSubmitError(data.error || "Não foi possível iniciar o pagamento online.");
        return;
      }

      window.location.href = data.checkout_url || data.link || "";
    } catch {
      setSubmitError("Não foi possível iniciar o pagamento online.");
    } finally {
      setLoadingPayment(false);
    }
  }

  return (
    <section className="py-6 sm:py-8">
      <Container>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase text-brand">Entrega</p>
          <h1 className="mt-1 text-3xl font-bold uppercase leading-none text-neutral-950 sm:text-4xl">
            Dados para finalizar
          </h1>
        </div>

        {!items.length ? (
          <div className="rounded-md border border-dashed border-neutral-300 p-10 text-center">
            <p className="font-normal text-neutral-700">Sua sacola está vazia.</p>
            <Button href="/catalogo" className="mt-5">
              Ver catálogo
            </Button>
          </div>
        ) : (
          <form onSubmit={payOnline} className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-5">
              <div className="rounded-md border border-neutral-200 bg-white p-5">
                <h2 className="text-xl font-bold uppercase text-neutral-950">Cliente</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input required value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} placeholder="Nome" />
                  <Input required value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} placeholder="Sobrenome" />
                  <Input required value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="Telefone" />
                  <Input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="E-mail" />
                </div>
              </div>

              <div className="rounded-md border border-neutral-200 bg-white p-5">
                <h2 className="text-xl font-bold uppercase text-neutral-950">Endereço</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Input required value={form.cep} onChange={(event) => updateField("cep", event.target.value)} placeholder="CEP" />
                    {cepStatus ? <p className="mt-2 text-xs font-normal text-neutral-500">{cepStatus}</p> : null}
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

              <div className="rounded-md border border-neutral-200 bg-white p-5">
                <h2 className="text-xl font-bold uppercase text-neutral-950">Nota fiscal</h2>
                <Input
                  required
                  className="mt-4"
                  inputMode="numeric"
                  maxLength={18}
                  value={form.document}
                  onChange={(event) => updateField("document", event.target.value)}
                  placeholder="CPF ou CNPJ"
                />
              </div>

              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-5">
                <h2 className="text-xl font-bold uppercase text-neutral-950">Frete</h2>
                {loadingShipping ? <p className="mt-4 text-sm font-normal text-neutral-600">Calculando opções...</p> : null}
                {shippingError ? <p className="mt-4 text-sm font-normal text-red-600">{shippingError}</p> : null}
                {!loadingShipping && !shipping && !shippingError ? (
                  <p className="mt-4 text-sm text-neutral-600">Informe o CEP e clique em “Buscar CEP e frete”.</p>
                ) : null}
                {shipping ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {shipping.options.filter((option) => option.service.toLowerCase() !== "loggi").map((option) => {
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
                          <p className="font-semibold uppercase text-neutral-950">{option.service}</p>
                          <p className="mt-1 text-sm font-normal text-neutral-500">{formatShippingOption(option)}</p>
                        </button>
                      );
                    })}
                    <p className="text-xs font-normal text-neutral-500 sm:col-span-2">{shippingMessage}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <aside className="h-fit rounded-md border border-neutral-200 bg-neutral-50 p-5">
              <h2 className="text-xl font-bold uppercase text-neutral-950">Resumo</h2>
              <div className="mt-4 grid gap-2 text-sm text-neutral-700">
                {items.map((item) => {
                  const sale = getProductSale(item.product);

                  return (
                    <div key={`${item.product.id}-${item.size}-${item.variation}`} className="flex justify-between gap-3">
                      <span>
                        {item.quantity}x {item.product.name}
                        {item.size ? ` · ${item.size}` : ""}
                        {item.variation ? ` · ${item.variation}` : ""}
                        {sale ? <span className="ml-1 text-[10px] font-semibold uppercase text-brand">{sale.percentOff}% OFF</span> : null}
                      </span>
                      <strong>{formatPrice(item.product.price * item.quantity)}</strong>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 grid gap-3 border-t border-neutral-200 pt-5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase text-neutral-700">Subtotal</span>
                  <span className="font-semibold text-neutral-950">{formatPrice(total)}</span>
                </div>
                {coupon ? (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="font-semibold uppercase">Cupom {coupon.code}</span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase text-neutral-700">
                    {selectedShipping ? `Frete ${selectedShipping.service}` : "Frete"}
                  </span>
                  <span className="font-semibold text-neutral-950">
                    {selectedShipping ? formatPrice(selectedShipping.price) : "A escolher"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
                  <span className="font-semibold uppercase text-neutral-700">Total</span>
                  <span className="text-2xl font-bold text-brand">{formatPrice(finalTotal)}</span>
                </div>
              </div>
              <div className="mt-5 rounded-md border border-neutral-200 bg-white p-3">
                <label className="text-xs font-semibold uppercase text-neutral-500" htmlFor="checkout-coupon">
                  Cupom de desconto
                </label>
                {coupon ? (
                  <div className="mt-3 rounded-md bg-emerald-50 p-3 text-sm font-normal text-emerald-800">
                    <p>Cupom {coupon.code} aplicado</p>
                    <p>Desconto: -{formatPrice(discountAmount)}</p>
                    <button type="button" onClick={removeCoupon} className="mt-2 text-xs font-semibold uppercase underline underline-offset-4">
                      Remover cupom
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <Input id="checkout-coupon" value={code} onChange={(event) => setCode(event.target.value)} placeholder="DESAPEGO10" />
                    <Button type="button" onClick={applyCoupon} disabled={loadingCoupon || !code.trim()}>
                      {loadingCoupon ? "..." : "Aplicar"}
                    </Button>
                  </div>
                )}
                {couponError ? <p className="mt-2 text-xs font-normal text-red-600">{couponError}</p> : null}
              </div>
              <p className="mt-4 text-xs font-normal leading-5 text-neutral-600">
                Parcelamento: {bestInstallment.label} de {bestInstallment.formattedInstallmentAmount} sobre o total com desconto.
              </p>
              {submitError ? <p className="mt-4 text-sm font-normal text-red-600">{submitError}</p> : null}
              <Button type="submit" className="mt-6 w-full gap-2" disabled={loadingPayment}>
                <CreditCard size={18} />
                {loadingPayment ? "Gerando pagamento..." : "Finalizar com Pix ou Cartão"}
              </Button>
              <Link href="/carrinho" className="mt-4 inline-block text-sm font-semibold text-brand hover:text-brand-secondary">
                Voltar para sacola
              </Link>
            </aside>
          </form>
        )}
      </Container>
    </section>
  );
}
