import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { validateActiveCoupon } from "@/lib/supabase/coupons";
import { calculateShippingWithSuperFrete, cleanCep } from "@/lib/superfrete";

type CheckoutItemInput = {
  productId?: string;
  size?: string;
  quantity?: number;
};

type CheckoutRequest = {
  items?: CheckoutItemInput[];
  customer?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
  address?: {
    cep?: string;
    city?: string;
    state?: string;
    neighborhood?: string;
    street?: string;
    number?: string;
    complement?: string;
  };
  shipping?: {
    service?: string;
    price?: number;
  };
  couponCode?: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  price: number | string;
  active: boolean;
  sold_out: boolean;
  stock_quantity: number;
};

const infinitePayUrl = "https://api.checkout.infinitepay.io/links";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function cents(value: number) {
  return Math.round(value * 100);
}

function sameMoney(first: number, second: number) {
  return cents(first) === cents(second);
}

const redirectUrl = "https://desapego-soares.vercel.app/pagamento/sucesso";

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase service role não configurado." }, { status: 500 });
  }

  const handle = process.env.INFINITEPAY_HANDLE?.trim();

  console.info("[infinitepay:diagnostic] INFINITEPAY_HANDLE encontrado:", Boolean(handle));

  if (!handle) {
    return NextResponse.json({ error: "INFINITEPAY_HANDLE não configurado." }, { status: 500 });
  }

  let body: CheckoutRequest;

  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return badRequest("Payload inválido.");
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const customer = body.customer;
  const address = body.address;
  const shipping = body.shipping;

  if (!items.length) return badRequest("Sacola vazia.");
  if (!customer || !clean(customer.firstName) || !clean(customer.lastName) || !clean(customer.phone) || !clean(customer.email)) {
    return badRequest("Dados do cliente incompletos.");
  }
  if (
    !address ||
    !clean(address.cep) ||
    !clean(address.city) ||
    !clean(address.state) ||
    !clean(address.neighborhood) ||
    !clean(address.street) ||
    !clean(address.number)
  ) {
    return badRequest("Endereço incompleto.");
  }
  if (!shipping || !clean(shipping.service) || !Number.isFinite(shipping.price) || Number(shipping.price) <= 0) {
    return badRequest("Frete inválido.");
  }

  const normalizedItems = items.map((item) => ({
    productId: clean(item.productId),
    size: clean(item.size),
    quantity: Number(item.quantity)
  }));

  if (normalizedItems.some((item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
    return badRequest("Itens inválidos.");
  }

  const productIds = Array.from(new Set(normalizedItems.map((item) => item.productId)));
  const { data: products, error: productsError } = await supabaseAdmin
    .from("products")
    .select("id,name,price,active,sold_out,stock_quantity")
    .in("id", productIds)
    .eq("active", true);

  if (productsError) {
    console.error("[infinitepay] Falha ao buscar produtos:", productsError);
    return NextResponse.json({ error: "Não foi possível validar os produtos." }, { status: 500 });
  }

  const productRows = (products as ProductRow[] | null) ?? [];
  const productMap = new Map(productRows.map((product) => [product.id, product]));

  if (productMap.size !== productIds.length) {
    return badRequest("Um ou mais produtos não estão disponíveis.");
  }

  if (productRows.some((product) => product.sold_out)) {
    return badRequest("Um ou mais produtos estão esgotados.");
  }

  if (normalizedItems.some((item) => Number(productMap.get(item.productId)?.stock_quantity ?? 0) < item.quantity)) {
    return badRequest("Quantidade máxima disponível em estoque.");
  }

  const orderItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productId)!;
    const unitPrice = Number(product.price);
    const subtotal = money(unitPrice * item.quantity);

    return {
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      size: item.size || null,
      unit_price: money(unitPrice),
      subtotal
    };
  });

  const subtotal = money(orderItems.reduce((sum, item) => sum + item.subtotal, 0));
  const shippingEstimate = await calculateShippingWithSuperFrete(cleanCep(address.cep)).catch((error) => {
    console.error("[infinitepay] Falha ao recalcular frete:", error instanceof Error ? error.message : "Erro desconhecido");
    return null;
  });

  if (!shippingEstimate) {
    return NextResponse.json({ error: "Não foi possível validar o frete escolhido." }, { status: 502 });
  }

  const selectedShipping = shippingEstimate.options.find((option) => option.service === clean(shipping.service));

  if (!selectedShipping || !sameMoney(selectedShipping.price, Number(shipping.price))) {
    return badRequest("Frete escolhido inválido ou desatualizado. Consulte o frete novamente.");
  }

  const shippingPrice = money(selectedShipping.price);
  const coupon = body.couponCode ? await validateActiveCoupon(body.couponCode, subtotal) : null;
  const discountAmount = coupon ? money(coupon.discountAmount) : 0;
  const discountedSubtotal = money(Math.max(0, subtotal - discountAmount));
  const total = money(discountedSubtotal + shippingPrice);

  if (body.couponCode && !coupon) {
    return badRequest("Cupom inválido ou expirado.");
  }

  if (total <= 0) {
    return badRequest("Total inválido para finalizar o checkout.");
  }

  const orderNsu = crypto.randomUUID();
  const itemDiscountCents = orderItems.reduce<number[]>((discounts, item, index) => {
    if (discountAmount <= 0) {
      return [...discounts, 0];
    }

    const previousDiscount = discounts.reduce((sum, value) => sum + value, 0);
    const itemDiscount =
      index === orderItems.length - 1
        ? cents(discountAmount) - previousDiscount
        : Math.min(cents(item.subtotal), Math.round((item.subtotal / subtotal) * cents(discountAmount)));

    return [...discounts, itemDiscount];
  }, []);

  const payableItems = orderItems.map((item, index) => ({
    ...item,
    payableSubtotalCents: Math.max(0, cents(item.subtotal) - itemDiscountCents[index])
  }));

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      order_nsu: orderNsu,
      capture_method: "infinitepay",
      status: "pending",
      customer_name: `${clean(customer.firstName)} ${clean(customer.lastName)}`,
      customer_email: clean(customer.email),
      customer_phone: clean(customer.phone),
      zip_code: clean(address.cep).replace(/\D/g, ""),
      address: clean(address.street),
      address_number: clean(address.number),
      complement: clean(address.complement) || null,
      neighborhood: clean(address.neighborhood),
      city: clean(address.city),
      state: clean(address.state),
      subtotal,
      shipping: shippingPrice,
      total,
      coupon_code: coupon?.code ?? null,
      discount_amount: discountAmount
    })
    .select("id,order_nsu")
    .single();

  if (orderError) {
    console.error("[infinitepay] Falha ao criar pedido:", orderError);
    return NextResponse.json({ error: "Não foi possível criar o pedido." }, { status: 500 });
  }

  const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
    orderItems.map((item) => ({
      order_id: order.id,
      ...item
    }))
  );

  if (itemsError) {
    console.error("[infinitepay] Falha ao criar itens:", itemsError);
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Não foi possível criar os itens do pedido." }, { status: 500 });
  }

  const payload = {
    handle,
    order_nsu: order.order_nsu,
    items: [
      ...payableItems.map((item) => ({
        quantity: 1,
        price: item.payableSubtotalCents,
        description: item.quantity > 1 ? `${item.quantity}x ${item.product_name}` : item.product_name
      })),
      {
        quantity: 1,
        price: cents(shippingPrice),
        description: `Frete ${selectedShipping.service}`
      }
    ],
    customer: {
      name: `${clean(customer.firstName)} ${clean(customer.lastName)}`,
      email: clean(customer.email),
      phone: clean(customer.phone)
    },
    address: {
      zip_code: clean(address.cep).replace(/\D/g, ""),
      street: clean(address.street),
      number: clean(address.number),
      complement: clean(address.complement),
      neighborhood: clean(address.neighborhood),
      city: clean(address.city),
      state: clean(address.state)
    },
    redirect_url: redirectUrl
  };

  console.info("[infinitepay:diagnostic] Payload sanitizado enviado:", {
    endpoint: infinitePayUrl,
    handle_found: Boolean(handle),
    handle_length: handle.length,
    order_nsu: payload.order_nsu,
    items: payload.items,
    customer: {
      name_present: Boolean(payload.customer.name),
      email_present: Boolean(payload.customer.email),
      phone_present: Boolean(payload.customer.phone)
    },
    address: {
      zip_code_present: Boolean(payload.address.zip_code),
      street_present: Boolean(payload.address.street),
      number_present: Boolean(payload.address.number),
      complement_present: Boolean(payload.address.complement),
      neighborhood_present: Boolean(payload.address.neighborhood),
      city: payload.address.city,
      state: payload.address.state
    },
    redirect_url: payload.redirect_url
  });

  const infinitePayResponse = await fetch(infinitePayUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const infinitePayData = (await infinitePayResponse.json().catch(() => ({}))) as {
    checkout_url?: string;
    link?: string;
    url?: string;
    invoice_slug?: string;
  };

  console.info("[infinitepay:diagnostic] Status HTTP InfinitePay:", infinitePayResponse.status);
  console.info("[infinitepay:diagnostic] Resposta completa InfinitePay:", infinitePayData);
  console.info("[infinitepay:diagnostic] Erro de validação InfinitePay:", !infinitePayResponse.ok ? infinitePayData : null);

  if (!infinitePayResponse.ok) {
    console.error("[infinitepay] Falha ao gerar link:", infinitePayData);
    return NextResponse.json({ error: "Não foi possível gerar o link de pagamento." }, { status: 502 });
  }

  const checkoutUrl = infinitePayData.checkout_url || infinitePayData.link || infinitePayData.url;

  if (!checkoutUrl) {
    console.error("[infinitepay] Resposta sem link:", infinitePayData);
    return NextResponse.json({ error: "A InfinitePay não retornou um link de pagamento." }, { status: 502 });
  }

  if (infinitePayData.invoice_slug) {
    await supabaseAdmin.from("orders").update({ invoice_slug: infinitePayData.invoice_slug }).eq("id", order.id);
  }

  return NextResponse.json({ checkout_url: checkoutUrl, order_id: order.id, order_nsu: order.order_nsu });
}
