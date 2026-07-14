import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-server";
import { deleteOrderForAdmin } from "@/lib/supabase/orders";

type Params = {
  params: Promise<{ id: string }>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await requireAdmin(`/admin/pedidos/${id}`);

  if (!uuidPattern.test(id)) {
    return NextResponse.json({ message: "Identificador de pedido inválido." }, { status: 400 });
  }

  try {
    const result = await deleteOrderForAdmin(id);

    if (!result) {
      return NextResponse.json({ message: "Supabase admin não configurado." }, { status: 503 });
    }

    if (result === "not_found") {
      return NextResponse.json({ message: "Pedido não encontrado." }, { status: 404 });
    }

    if (result === "blocked_status") {
      return NextResponse.json(
        { message: "Somente pedidos pendentes e sem pagamento podem ser excluídos permanentemente." },
        { status: 409 }
      );
    }

    if (result === "blocked_payment") {
      return NextResponse.json(
        { message: "Este pedido possui dados da InfinitePay e precisa ser preservado para conciliação." },
        { status: 409 }
      );
    }

    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${id}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Não foi possível excluir o pedido. Verifique as relações do banco e tente novamente." },
      { status: 500 }
    );
  }
}
