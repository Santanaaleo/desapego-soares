import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-md">
        <p className="text-sm font-black uppercase text-brand">Admin</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase text-neutral-950">Entrar no painel</h1>
        <p className="mt-3 text-sm font-bold text-neutral-600">Acesso exclusivo do dono da loja.</p>
        <div className="mt-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
