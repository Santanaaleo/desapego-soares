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
