"use client";

import { useEffect, useState } from "react";
import { couponStorageKey } from "@/lib/coupons";
import type { AppliedCoupon } from "@/types/coupon";

function readCoupon() {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(couponStorageKey);
    return value ? (JSON.parse(value) as AppliedCoupon) : null;
  } catch {
    return null;
  }
}

export function useCoupon(subtotal: number) {
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(() => readCoupon());
  const [code, setCode] = useState(() => readCoupon()?.code ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function syncCoupon() {
      const nextCoupon = readCoupon();
      setCoupon(nextCoupon);
      setCode(nextCoupon?.code ?? "");
    }

    window.addEventListener("storage", syncCoupon);
    window.addEventListener("coupon-updated", syncCoupon);

    return () => {
      window.removeEventListener("storage", syncCoupon);
      window.removeEventListener("coupon-updated", syncCoupon);
    };
  }, []);

  async function applyCoupon() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal })
      });
      const data = (await response.json()) as AppliedCoupon | { error?: string };

      if (!response.ok) {
        setCoupon(null);
        window.localStorage.removeItem(couponStorageKey);
        window.dispatchEvent(new Event("coupon-updated"));
        setError(("error" in data && data.error) || "Cupom inválido ou expirado.");
        return;
      }

      const applied = data as AppliedCoupon;
      setCoupon(applied);
      setCode(applied.code);
      window.localStorage.setItem(couponStorageKey, JSON.stringify(applied));
      window.dispatchEvent(new Event("coupon-updated"));
    } catch {
      setError("Cupom inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  function removeCoupon() {
    setCoupon(null);
    setCode("");
    setError("");
    window.localStorage.removeItem(couponStorageKey);
    window.dispatchEvent(new Event("coupon-updated"));
  }

  return { coupon, code, setCode, loading, error, applyCoupon, removeCoupon };
}
