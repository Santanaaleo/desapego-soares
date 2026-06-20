import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function PagamentoSucessoPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto max-w-xl rounded-md border border-neutral-200 bg-white p-6 text-center sm:p-8">
          <p className="text-xs font-black uppercase text-brand">Pagamento</p>
          <h1 className="mt-2 font-display text-3xl font-black uppercase leading-none text-neutral-950 sm:text-4xl">
            Pagamento iniciado
          </h1>
          <p className="mt-4 text-sm font-semibold text-neutral-600">
            Se o pagamento foi concluído, seu pedido será confirmado pela loja.
          </p>
          <Button href="/catalogo" className="mt-6">
            Voltar ao catálogo
          </Button>
        </div>
      </Container>
    </section>
  );
}
