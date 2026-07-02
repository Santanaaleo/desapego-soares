import { calculateCouponDiscount, normalizeCouponCode } from "@/lib/coupons";
import type { AppliedCoupon, Coupon } from "@/types/coupon";
import { supabaseAdmin } from "./server";

const couponsTable = "coupons";

type CouponInput = {
  code: string;
  discountPercent: number;
  active: boolean;
};

function normalizeCoupon(row: Coupon) {
  return { ...row, discount_percent: Number(row.discount_percent) };
}

export function validateCouponInput(input: CouponInput) {
  const code = normalizeCouponCode(input.code);
  const discountPercent = Number(input.discountPercent);

  if (!code) {
    return { error: "Informe o código do cupom." };
  }

  if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
    return { error: "Informe um desconto maior que 0 e menor ou igual a 100." };
  }

  return { code, discountPercent, active: Boolean(input.active) };
}

export async function listCouponsForAdmin() {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin.from(couponsTable).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as Coupon[] | null) ?? []).map(normalizeCoupon);
}

export async function createCouponForAdmin(input: CouponInput) {
  if (!supabaseAdmin) return null;

  const validated = validateCouponInput(input);
  if ("error" in validated) throw new Error(validated.error);

  const { data, error } = await supabaseAdmin
    .from(couponsTable)
    .insert({ code: validated.code, discount_percent: validated.discountPercent, active: validated.active })
    .select("*")
    .single();
  if (error) throw error;
  return normalizeCoupon(data as Coupon);
}

export async function updateCouponForAdmin(id: string, input: CouponInput) {
  if (!supabaseAdmin) return null;

  const validated = validateCouponInput(input);
  if ("error" in validated) throw new Error(validated.error);

  const { data, error } = await supabaseAdmin
    .from(couponsTable)
    .update({
      code: validated.code,
      discount_percent: validated.discountPercent,
      active: validated.active,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return normalizeCoupon(data as Coupon);
}

export async function deleteCouponForAdmin(id: string) {
  if (!supabaseAdmin) return null;

  const { error } = await supabaseAdmin.from(couponsTable).delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function validateActiveCoupon(code: string, subtotal: number): Promise<AppliedCoupon | null> {
  if (!supabaseAdmin) return null;

  const normalizedCode = normalizeCouponCode(code);
  if (!normalizedCode || subtotal <= 0) return null;

  const { data, error } = await supabaseAdmin
    .from(couponsTable)
    .select("code,discount_percent,active")
    .eq("code", normalizedCode)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) return null;

  const discountPercent = Number(data.discount_percent);
  if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) return null;

  return {
    code: data.code,
    discountPercent,
    discountAmount: calculateCouponDiscount(subtotal, discountPercent)
  };
}
