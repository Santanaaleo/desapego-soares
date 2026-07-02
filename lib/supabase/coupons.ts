import { calculateCouponDiscount, normalizeCouponCode } from "@/lib/coupons";
import type { AppliedCoupon, Coupon } from "@/types/coupon";
import { supabaseAdmin } from "./server";

const couponsTable = "coupons";

type CouponInput = {
  code: string;
  discountPercent: number;
  active: boolean;
  usageLimit?: number | null;
};

function normalizeCoupon(row: Coupon) {
  return {
    ...row,
    discount_percent: Number(row.discount_percent),
    usage_limit: row.usage_limit === null ? null : Number(row.usage_limit),
    usage_count: Number(row.usage_count)
  };
}

export function validateCouponInput(input: CouponInput) {
  const code = normalizeCouponCode(input.code);
  const discountPercent = Number(input.discountPercent);
  const usageLimit = input.usageLimit === null || input.usageLimit === undefined ? null : Number(input.usageLimit);

  if (!code) {
    return { error: "Informe o código do cupom." };
  }

  if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
    return { error: "Informe um desconto maior que 0 e menor ou igual a 100." };
  }

  if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit <= 0)) {
    return { error: "Informe um limite de usos maior que 0 ou deixe vazio." };
  }

  return { code, discountPercent, active: Boolean(input.active), usageLimit };
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
    .insert({
      code: validated.code,
      discount_percent: validated.discountPercent,
      active: validated.active,
      usage_limit: validated.usageLimit
    })
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
      usage_limit: validated.usageLimit,
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
    .select("code,discount_percent,active,usage_limit,usage_count")
    .eq("code", normalizedCode)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) return null;

  const usageLimit = data.usage_limit === null ? null : Number(data.usage_limit);
  const usageCount = Number(data.usage_count);

  if (usageLimit !== null && usageCount >= usageLimit) {
    throw new Error("Cupom esgotado.");
  }

  const discountPercent = Number(data.discount_percent);
  if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) return null;

  return {
    code: data.code,
    discountPercent,
    discountAmount: calculateCouponDiscount(subtotal, discountPercent)
  };
}

export async function incrementCouponUsage(code: string) {
  if (!supabaseAdmin) return null;

  const normalizedCode = normalizeCouponCode(code);
  if (!normalizedCode) return null;

  const { data, error } = await supabaseAdmin
    .from(couponsTable)
    .select("id,usage_limit,usage_count")
    .eq("code", normalizedCode)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const usageLimit = data.usage_limit === null ? null : Number(data.usage_limit);
  const nextUsageCount = Number(data.usage_count) + 1;

  const updatePayload: { usage_count: number; active?: boolean; updated_at: string } = {
    usage_count: nextUsageCount,
    updated_at: new Date().toISOString()
  };

  if (usageLimit !== null && nextUsageCount >= usageLimit) {
    updatePayload.active = false;
  }

  const { error: updateError } = await supabaseAdmin
    .from(couponsTable)
    .update(updatePayload)
    .eq("id", data.id);

  if (updateError) throw updateError;
  return nextUsageCount;
}
