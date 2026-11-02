alter table public.transactions
  add column if not exists card_type text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transactions_card_type_check'
      and conrelid = 'public.transactions'::regclass
  ) then
    alter table public.transactions
      add constraint transactions_card_type_check
      check (card_type is null or card_type in ('Physical', 'E-code'));
  end if;
end
$$;
