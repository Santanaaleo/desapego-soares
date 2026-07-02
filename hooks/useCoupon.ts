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

  function storeCoupon(nextCoupon: AppliedCoupon | null) {
    setCoupon(nextCoupon);
    setCode(nextCoupon?.code ?? "");

    if (nextCoupon) {
      window.localStorage.setItem(couponStorageKey, JSON.stringify(nextCoupon));
    } else {
      window.localStorage.removeItem(couponStorageKey);
    }

    window.dispatchEvent(new Event("coupon-updated"));
  }

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

  useEffect(() => {
    if (!coupon) return;

    if (coupon.subtotal === subtotal) return;

    if (subtotal <= 0) {
      queueMicrotask(() => {
        storeCoupon(null);
        setError("");
      });
      return;
    }

    const couponCode = coupon.code;

    const controller = new AbortController();

    async function refreshCoupon() {
      try {
        const response = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: couponCode, subtotal }),
          signal: controller.signal
        });
        const data = (await response.json()) as AppliedCoupon | { error?: string };

        if (!response.ok) {
          storeCoupon(null);
          setError(("error" in data && data.error) || "Cupom inválido ou expirado.");
          return;
        }

        storeCoupon({ ...(data as AppliedCoupon), subtotal });
        setError("");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setError("Não foi possível recalcular o cupom agora.");
      }
    }

    refreshCoupon();

    return () => controller.abort();
  }, [subtotal, coupon]);

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
        storeCoupon(null);
        setError(("error" in data && data.error) || "Cupom inválido ou expirado.");
        return;
      }

      const applied = data as AppliedCoupon;
      storeCoupon({ ...applied, subtotal });
    } catch {
      setError("Cupom inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  function removeCoupon() {
    storeCoupon(null);
    setError("");
  }

  return { coupon, code, setCode, loading, error, applyCoupon, removeCoupon };
}
