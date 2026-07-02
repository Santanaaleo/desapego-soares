"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { normalizeCouponCode } from "@/lib/coupons";
import type { Coupon } from "@/types/coupon";
import { LogoutButton } from "./LogoutButton";

type FormState = {
  id?: string;
  code: string;
  discountPercent: string;
  active: boolean;
};

const emptyForm: FormState = { code: "", discountPercent: "", active: true };

export function CouponsAdmin({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const editing = Boolean(form.id);

  function resetForm() {
    setForm(emptyForm);
    setMessage("");
  }

  async function submitCoupon(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(editing ? `/api/admin/coupons/${form.id}` : "/api/admin/coupons", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          discountPercent: Number(form.discountPercent),
          active: form.active
        })
      });
      const data = (await response.json()) as Coupon | { message?: string };

      if (!response.ok) {
        setMessage(("message" in data && data.message) || "Não foi possível salvar o cupom.");
        return;
      }

      const coupon = data as Coupon;
      setCoupons((current) => (editing ? current.map((item) => (item.id === coupon.id ? coupon : item)) : [coupon, ...current]));
      resetForm();
    } catch {
      setMessage("Não foi possível salvar o cupom.");
    } finally {
      setLoading(false);
    }
  }

  function editCoupon(coupon: Coupon) {
    setForm({
      id: coupon.id,
      code: coupon.code,
      discountPercent: String(coupon.discount_percent),
      active: coupon.active
    });
    setMessage("");
  }

  async function toggleCoupon(coupon: Coupon) {
    await updateCoupon(coupon, { active: !coupon.active });
  }

  async function updateCoupon(coupon: Coupon, changes: Partial<FormState>) {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: changes.code ?? coupon.code,
          discountPercent: Number(changes.discountPercent ?? coupon.discount_percent),
          active: changes.active ?? coupon.active
        })
      });
      const data = (await response.json()) as Coupon | { message?: string };

      if (!response.ok) {
        setMessage(("message" in data && data.message) || "Não foi possível atualizar o cupom.");
        return;
      }

      const nextCoupon = data as Coupon;
      setCoupons((current) => current.map((item) => (item.id === nextCoupon.id ? nextCoupon : item)));
    } catch {
      setMessage("Não foi possível atualizar o cupom.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCoupon(coupon: Coupon) {
    if (!window.confirm(`Excluir o cupom ${coupon.code}?`)) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        setMessage(data.message || "Não foi possível excluir o cupom.");
        return;
      }

      setCoupons((current) => current.filter((item) => item.id !== coupon.id));
      if (form.id === coupon.id) resetForm();
    } catch {
      setMessage("Não foi possível excluir o cupom.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase text-brand">Admin</p>
            <h1 className="mt-2 font-display text-4xl font-black text-neutral-950 sm:text-5xl">Cupons</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/admin" variant="secondary">Produtos</Button>
            <Button href="/admin/pedidos" variant="secondary">Pedidos</Button>
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={submitCoupon} className="h-fit rounded-md border border-neutral-100 bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl font-black uppercase text-neutral-950">{editing ? "Editar cupom" : "Novo cupom"}</h2>
            <div className="mt-4 grid gap-3">
              <label className="text-xs font-black uppercase text-neutral-500" htmlFor="coupon-code">Código do cupom</label>
              <Input
                id="coupon-code"
                required
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: normalizeCouponCode(event.target.value) }))}
                placeholder="DESAPEGO10"
              />
              <label className="text-xs font-black uppercase text-neutral-500" htmlFor="coupon-discount">Porcentagem de desconto</label>
              <Input
                id="coupon-discount"
                required
                min="0.01"
                max="100"
                step="0.01"
                type="number"
                value={form.discountPercent}
                onChange={(event) => setForm((current) => ({ ...current, discountPercent: event.target.value }))}
                placeholder="10"
              />
              <label className="flex items-center gap-3 text-sm font-bold text-neutral-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                />
                Ativo
              </label>
            </div>
            {message ? <p className="mt-4 text-sm font-semibold text-red-600">{message}</p> : null}
            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="submit" disabled={loading}>{loading ? "Salvando..." : editing ? "Salvar" : "Criar cupom"}</Button>
              {editing ? <Button type="button" variant="secondary" onClick={resetForm}>Cancelar</Button> : null}
            </div>
          </form>

          <div className="overflow-hidden rounded-md border border-neutral-100 bg-white shadow-sm">
            {!coupons.length ? (
              <div className="p-10 text-center font-bold text-neutral-600">Nenhum cupom cadastrado.</div>
            ) : (
              coupons.map((coupon) => (
                <div key={coupon.id} className="grid gap-3 border-b border-neutral-100 p-4 last:border-b-0 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
                  <div>
                    <p className="font-black text-neutral-950">{coupon.code}</p>
                    <p className="text-sm font-semibold text-neutral-500">Desconto: {coupon.discount_percent}%</p>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${coupon.active ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-600"}`}>
                    {coupon.active ? "Ativo" : "Inativo"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" onClick={() => editCoupon(coupon)}>Editar</Button>
                    <Button type="button" variant="secondary" onClick={() => toggleCoupon(coupon)} disabled={loading}>
                      {coupon.active ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                  <Button type="button" variant="ghost" onClick={() => deleteCoupon(coupon)} disabled={loading}>Excluir</Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
