"use client";

import { Archive, RotateCcw, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatOrderNumber } from "@/types/order";

type Props = {
  orderId: string;
  orderNumber: number;
  canDelete: boolean;
  archived: boolean;
};

type OrderAction = "delete" | "archive" | "restore";

const actionContent: Record<
  OrderAction,
  { button: string; confirm: string; description: (orderNumber: string) => string }
> = {
  delete: {
    button: "Excluir permanentemente",
    confirm: "Excluir permanentemente",
    description: (orderNumber) =>
      `Tem certeza que deseja excluir permanentemente o Pedido ${orderNumber}? Esta ação não poderá ser desfeita.`
  },
  archive: {
    button: "Arquivar pedido",
    confirm: "Arquivar pedido",
    description: (orderNumber) =>
      `Deseja arquivar o Pedido ${orderNumber}? Ele será removido da lista principal, mas seus dados continuarão preservados.`
  },
  restore: {
    button: "Restaurar pedido",
    confirm: "Restaurar pedido",
    description: (orderNumber) =>
      `Deseja restaurar o Pedido ${orderNumber}? Ele voltará para a listagem correspondente ao seu status.`
  }
};

export function OrderManagementSection({ orderId, orderNumber, canDelete, archived }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const action: OrderAction = archived ? "restore" : canDelete ? "delete" : "archive";
  const content = actionContent[action];
  const formattedOrderNumber = formatOrderNumber(orderNumber);
  const Icon = action === "delete" ? Trash2 : action === "archive" ? Archive : RotateCcw;

  async function confirmAction() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: action === "delete" ? undefined : { "Content-Type": "application/json" },
        body: action === "delete" ? undefined : JSON.stringify({ action })
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setMessage(data.message || "Não foi possível atualizar o pedido.");
        return;
      }

      if (action === "archive") {
        router.replace("/admin/pedidos?view=archived&resultado=arquivado");
      } else if (action === "restore") {
        router.replace("/admin/pedidos?resultado=restaurado");
      } else {
        router.replace("/admin/pedidos?resultado=excluido");
      }
      router.refresh();
    } catch {
      setMessage("Não foi possível atualizar o pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`mt-6 border-t pt-5 ${action === "delete" ? "border-red-200" : "border-neutral-200"}`}>
      <p className={`text-xs font-semibold uppercase ${action === "delete" ? "text-red-700" : "text-neutral-600"}`}>
        {action === "delete" ? "Área destrutiva" : archived ? "Pedido arquivado" : "Preservação financeira"}
      </p>
      <p className="mt-2 text-sm text-neutral-600">
        {action === "delete"
          ? "A exclusão remove permanentemente o pedido e seus itens relacionados."
          : archived
            ? "A restauração devolve o pedido à lista principal sem alterar seus dados."
            : "Pedidos financeiros são arquivados sem apagar pagamento, itens, cliente ou rastreio."}
      </p>
      <button
        type="button"
        onClick={() => {
          setMessage("");
          setOpen(true);
        }}
        className={`focus-ring mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition ${
          action === "delete"
            ? "border border-red-300 text-red-700 hover:bg-red-50"
            : "bg-neutral-950 text-white hover:bg-brand"
        }`}
      >
        <Icon size={17} aria-hidden="true" />
        {content.button}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-action-title"
            aria-describedby="order-action-description"
            className="w-full max-w-lg rounded-md bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs font-semibold uppercase ${action === "delete" ? "text-red-700" : "text-brand"}`}>
                  Confirmação manual
                </p>
                <h2 id="order-action-title" className="mt-1 text-xl font-bold text-neutral-950">
                  {content.button}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Fechar confirmação"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="focus-ring rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 disabled:opacity-50"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <p id="order-action-description" className="mt-5 text-sm leading-6 text-neutral-700">
              {content.description(formattedOrderNumber)}
            </p>

            {message ? (
              <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {message}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="focus-ring h-11 rounded-md border border-neutral-300 px-5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={confirmAction}
                className={`focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  action === "delete" ? "bg-red-700 hover:bg-red-800" : "bg-brand hover:bg-brand-secondary"
                }`}
              >
                <Icon size={17} aria-hidden="true" />
                {loading ? "Processando..." : content.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
