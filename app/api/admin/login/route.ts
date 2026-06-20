import { NextResponse } from "next/server";
import { createAdminToken, getAdminCookieName, getAdminTokenMaxAge } from "@/lib/admin-auth";

const maxAttempts = 5;
const windowMs = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 0, resetAt: now + windowMs });
    return false;
  }

  return current.count >= maxAttempts;
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  attempts.set(key, { ...current, count: current.count + 1 });
}

function clearAttempts(key: string) {
  attempts.delete(key);
}

export async function POST(request: Request) {
  const rateLimitKey = getClientIp(request);

  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json({ message: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429 });
  }

  const { user, password } = (await request.json()) as { user?: string; password?: string };
  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPassword) {
    return NextResponse.json({ message: "Credenciais admin não configuradas." }, { status: 500 });
  }

  if (user !== adminUser || password !== adminPassword) {
    recordFailedAttempt(rateLimitKey);
    return NextResponse.json({ message: "Usuário ou senha inválidos." }, { status: 401 });
  }

  clearAttempts(rateLimitKey);

  const token = await createAdminToken(adminPassword);
  const response = NextResponse.json({ ok: true });

  response.cookies.set(getAdminCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getAdminTokenMaxAge()
  });

  return response;
}
