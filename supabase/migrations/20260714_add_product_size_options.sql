alter table products
  add column if not exists size_options text[] not null default '{}'::text[];

update products
set size_options = '{}'::text[]
where size_options is null;

alter table products
  alter column size_options set default '{}'::text[],
  alter column size_options set not null;
