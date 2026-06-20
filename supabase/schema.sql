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

alter table products enable row level security;

drop policy if exists "Public can read active products" on products;
create policy "Public can read active products"
  on products
  for select
  to anon, authenticated
  using (active = true);

-- No insert/update/delete policies are created for anon/authenticated roles.
-- Admin writes must go through protected server routes using SUPABASE_SERVICE_ROLE_KEY.
