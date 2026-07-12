create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null,
  category text not null,
  brand text,
  sizes text[] default '{}',
  condition text,
  featured boolean default false,
  active boolean default true,
  images text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists products_category_idx on products (category);
create index if not exists products_featured_idx on products (featured);
create index if not exists products_active_idx on products (active);

alter table products
  add column if not exists stock_quantity integer not null default 1;

alter table products
  add column if not exists variations text[] not null default '{}'::text[];

alter table order_items
  add column if not exists variation text;

alter table products
  add constraint products_stock_quantity_check check (stock_quantity >= 0);

create index if not exists products_stock_quantity_idx on products (stock_quantity);

create or replace function confirm_order_paid_with_stock(
  input_order_nsu text,
  input_transaction_nsu text default null,
  input_invoice_slug text default null,
  input_receipt_url text default null,
  input_capture_method text default null
)
returns table(id uuid, order_nsu text, status text, coupon_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row orders%rowtype;
  order_item record;
  current_stock integer;
  next_stock integer;
begin
  select *
    into order_row
    from orders
    where orders.order_nsu = input_order_nsu
    for update;

  if not found then
    return;
  end if;

  if order_row.status = 'paid' then
    return;
  end if;

  for order_item in
    select product_id, quantity
      from order_items
      where order_id = order_row.id
        and product_id is not null
  loop
    select stock_quantity
      into current_stock
      from products
      where products.id = order_item.product_id
      for update;

    if current_stock is null then
      raise exception 'Produto não encontrado.';
    end if;

    if current_stock < order_item.quantity then
      raise exception 'Estoque insuficiente.';
    end if;

    next_stock := current_stock - order_item.quantity;

    update products
      set stock_quantity = next_stock,
          sold_out = next_stock = 0,
          updated_at = now()
      where products.id = order_item.product_id;
  end loop;

  update orders
    set status = 'paid',
        transaction_nsu = input_transaction_nsu,
        invoice_slug = input_invoice_slug,
        receipt_url = input_receipt_url,
        capture_method = input_capture_method,
        updated_at = now()
    where orders.id = order_row.id
    returning orders.id, orders.order_nsu, orders.status, orders.coupon_code
    into id, order_nsu, status, coupon_code;

  return next;
end;
$$;

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_percent numeric not null,
  active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint coupons_discount_percent_check check (
    discount_percent > 0
    and discount_percent <= 100
  ),
  constraint coupons_code_trim_upper_check check (
    code = upper(trim(code))
    and code <> ''
  )
);

create index if not exists coupons_active_idx on coupons (active);

alter table coupons
  add column if not exists usage_limit integer,
  add column if not exists usage_count integer not null default 0;

alter table coupons
  add constraint coupons_usage_limit_check check (
    usage_limit is null
    or usage_limit > 0
  );

alter table coupons
  add constraint coupons_usage_count_check check (usage_count >= 0);

create index if not exists coupons_usage_limit_idx on coupons (usage_limit);

alter table orders
  add column if not exists coupon_code text,
  add column if not exists discount_amount numeric(10,2) not null default 0,
  add column if not exists customer_document text;

alter table orders
  add constraint orders_discount_amount_check check (discount_amount >= 0);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_customer_document_check'
      and conrelid = 'orders'::regclass
  ) then
    alter table orders
      add constraint orders_customer_document_check check (
        customer_document is null
        or customer_document ~ '^([0-9]{11}|[0-9]{14})$'
      );
  end if;
end
$$;

alter table products enable row level security;
alter table coupons enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "Public can read active products" on products;
create policy "Public can read active products"
  on products
  for select
  to anon, authenticated
  using (active = true);

-- No insert/update/delete policies are created for anon/authenticated roles.
-- Admin writes must go through protected server routes using SUPABASE_SERVICE_ROLE_KEY.
