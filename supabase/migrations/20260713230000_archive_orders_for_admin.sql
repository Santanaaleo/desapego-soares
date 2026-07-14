alter table public.orders
  add column if not exists archived_at timestamp with time zone;

create index if not exists orders_active_created_at_idx
  on public.orders (created_at desc)
  where archived_at is null;

create index if not exists orders_archived_at_idx
  on public.orders (archived_at desc)
  where archived_at is not null;

create or replace function public.set_order_archived_for_admin(
  input_order_id uuid,
  input_archived boolean
)
returns table(result text, archived_at_value timestamp with time zone)
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.orders%rowtype;
begin
  select *
    into order_row
    from public.orders
    where id = input_order_id
    for update;

  if not found then
    return query select 'not_found'::text, null::timestamp with time zone;
    return;
  end if;

  if input_archived then
    if order_row.archived_at is not null then
      return query select 'already_archived'::text, order_row.archived_at;
      return;
    end if;

    update public.orders
      set archived_at = now()
      where id = input_order_id
      returning orders.archived_at into archived_at_value;

    return query select 'archived'::text, archived_at_value;
    return;
  end if;

  if order_row.archived_at is null then
    return query select 'already_active'::text, null::timestamp with time zone;
    return;
  end if;

  update public.orders
    set archived_at = null
    where id = input_order_id;

  return query select 'restored'::text, null::timestamp with time zone;
end;
$$;

revoke all on function public.set_order_archived_for_admin(uuid, boolean) from public;
revoke all on function public.set_order_archived_for_admin(uuid, boolean) from anon;
revoke all on function public.set_order_archived_for_admin(uuid, boolean) from authenticated;
grant execute on function public.set_order_archived_for_admin(uuid, boolean) to service_role;

create or replace function public.delete_order_for_admin(input_order_id uuid)
returns table(result text)
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.orders%rowtype;
begin
  select *
    into order_row
    from public.orders
    where id = input_order_id
    for update;

  if not found then
    return query select 'not_found'::text;
    return;
  end if;

  if order_row.archived_at is not null then
    return query select 'blocked_archived'::text;
    return;
  end if;

  if order_row.status is distinct from 'pending' then
    return query select 'blocked_status'::text;
    return;
  end if;

  if nullif(btrim(order_row.order_nsu), '') is not null
    or nullif(btrim(order_row.transaction_nsu), '') is not null
    or nullif(btrim(order_row.invoice_slug), '') is not null
    or nullif(btrim(order_row.receipt_url), '') is not null
    or nullif(btrim(order_row.capture_method), '') is not null then
    return query select 'blocked_payment'::text;
    return;
  end if;

  delete from public.order_items where order_id = input_order_id;
  delete from public.orders where id = input_order_id;

  return query select 'deleted'::text;
end;
$$;

revoke all on function public.delete_order_for_admin(uuid) from public;
revoke all on function public.delete_order_for_admin(uuid) from anon;
revoke all on function public.delete_order_for_admin(uuid) from authenticated;
grant execute on function public.delete_order_for_admin(uuid) to service_role;
