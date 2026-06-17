import { NextResponse } from "next/server";
import { createAdminToken, getAdminCookieName, getAdminTokenMaxAge } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { user, password } = (await request.json()) as { user?: string; password?: string };
  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPassword) {
    return NextResponse.json({ message: "Credenciais admin não configuradas." }, { status: 500 });
  }

  if (user !== adminUser || password !== adminPassword) {
    return NextResponse.json({ message: "Usuário ou senha inválidos." }, { status: 401 });
  }

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
