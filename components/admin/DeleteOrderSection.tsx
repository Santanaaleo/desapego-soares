"use client";

import { Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatOrderNumber } from "@/types/order";

type Props = {
  orderId: string;
  orderNumber: number;
  canDelete: boolean;
};

export function DeleteOrderSection({ orderId, orderNumber, canDelete }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const formattedOrderNumber = formatOrderNumber(orderNumber);

  async function deleteOrder() {
    setDeleting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      const data = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setMessage(data.message || "Não foi possível excluir o pedido.");
        return;
      }

      router.replace("/admin/pedidos?excluido=1");
      router.refresh();
    } catch {
      setMessage("Não foi possível excluir o pedido.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-6 border-t border-red-200 pt-5">
      <p className="text-xs font-bold uppercase text-red-700">Área destrutiva</p>
      <p className="mt-2 text-sm text-neutral-600">
        {canDelete
          ? "A exclusão remove permanentemente o pedido e seus itens relacionados."
          : "Este pedido precisa ser preservado por causa do status ou dos dados de pagamento."}
      </p>
      <button
        type="button"
        disabled={!canDelete}
        onClick={() => {
          setMessage("");
          setOpen(true);
        }}
        className="focus-ring mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-red-300 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 disabled:hover:bg-transparent"
      >
        <Trash2 size={17} aria-hidden="true" />
        Excluir pedido
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-order-title"
            aria-describedby="delete-order-description"
            className="w-full max-w-lg rounded-md bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-red-700">Exclusão permanente</p>
                <h2 id="delete-order-title" className="mt-1 text-xl font-bold text-neutral-950">
                  Excluir pedido
                </h2>
              </div>
              <button
                type="button"
                aria-label="Fechar confirmação"
                disabled={deleting}
                onClick={() => setOpen(false)}
                className="focus-ring rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 disabled:opacity-50"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <p id="delete-order-description" className="mt-5 text-sm leading-6 text-neutral-700">
              Tem certeza que deseja excluir permanentemente o Pedido {formattedOrderNumber}? Esta ação não poderá ser desfeita.
            </p>

            {message ? (
              <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">
                {message}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setOpen(false)}
                className="focus-ring h-11 rounded-md border border-neutral-300 px-5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={deleteOrder}
                className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={17} aria-hidden="true" />
                {deleting ? "Excluindo..." : "Excluir permanentemente"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
