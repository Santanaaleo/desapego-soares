update public.products
set category = 'Acessórios'
where lower(btrim(category)) in ('óculos', 'oculos');
