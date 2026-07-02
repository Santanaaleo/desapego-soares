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
  add column if not exists discount_amount numeric(10,2) not null default 0;

alter table orders
  add constraint orders_discount_amount_check check (discount_amount >= 0);

alter table products enable row level security;
alter table coupons enable row level security;

drop policy if exists "Public can read active products" on products;
create policy "Public can read active products"
  on products
  for select
  to anon, authenticated
  using (active = true);

-- No insert/update/delete policies are created for anon/authenticated roles.
-- Admin writes must go through protected server routes using SUPABASE_SERVICE_ROLE_KEY.
