import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-server";
import { deleteOrderForAdmin, setOrderArchivedForAdmin } from "@/lib/supabase/orders";

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

    if (result === "blocked_archived") {
      return NextResponse.json({ message: "Restaure o pedido antes de excluí-lo permanentemente." }, { status: 409 });
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

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  await requireAdmin(`/admin/pedidos/${id}`);

  if (!uuidPattern.test(id)) {
    return NextResponse.json({ message: "Identificador de pedido inválido." }, { status: 400 });
  }

  let body: { action?: unknown };

  try {
    body = (await request.json()) as { action?: unknown };
  } catch {
    return NextResponse.json({ message: "Corpo da solicitação inválido." }, { status: 400 });
  }

  try {
    if (body.action !== "archive" && body.action !== "restore") {
      return NextResponse.json({ message: "Ação inválida." }, { status: 400 });
    }

    const result = await setOrderArchivedForAdmin(id, body.action === "archive");

    if (!result) {
      return NextResponse.json({ message: "Supabase admin não configurado." }, { status: 503 });
    }

    if (result === "not_found") {
      return NextResponse.json({ message: "Pedido não encontrado." }, { status: 404 });
    }

    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${id}`);
    return NextResponse.json({ ok: true, result });
  } catch {
    return NextResponse.json({ message: "Não foi possível atualizar o arquivamento do pedido." }, { status: 500 });
  }
}
