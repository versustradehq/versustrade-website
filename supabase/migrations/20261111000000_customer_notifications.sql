create table if not exists public.customer_notifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 transaction_id uuid references public.transactions(id) on delete set null,
 reference text not null,
 event_type text not null check (event_type in ('TRADE_CREATED','STATUS_CHANGED')),
 title text not null, message text not null, status text,
 is_read boolean not null default false, created_at timestamptz not null default now()
);
create index if not exists customer_notifications_user_created_idx on public.customer_notifications(user_id,created_at desc);
create index if not exists customer_notifications_user_unread_idx on public.customer_notifications(user_id,is_read,created_at desc);
alter table public.customer_notifications enable row level security;
grant select,update,delete on public.customer_notifications to authenticated;
drop policy if exists "Customers read own notifications" on public.customer_notifications;
create policy "Customers read own notifications" on public.customer_notifications for select to authenticated using(auth.uid()=user_id);
drop policy if exists "Customers update own notifications" on public.customer_notifications;
create policy "Customers update own notifications" on public.customer_notifications for update to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "Customers delete own notifications" on public.customer_notifications;
create policy "Customers delete own notifications" on public.customer_notifications for delete to authenticated using(auth.uid()=user_id);
create or replace function public.notify_customer_trade_event() returns trigger language plpgsql security definer set search_path=public as $$
declare t text; m text; k text;
begin
 if tg_op='INSERT' then
  k:='TRADE_CREATED'; t:='Trade received'; m:='Your trade '||new.reference||' has been registered and is now Processing.';
  insert into public.customer_notifications(user_id,transaction_id,reference,event_type,title,message,status) values(new.customer_id,new.id,new.reference,k,t,m,new.status);
  return new;
 end if;
 if new.status is distinct from old.status then
  k:='STATUS_CHANGED'; t:='Trade status updated';
  m:='Your trade '||new.reference||' is now '||case new.status when 'VT-PRO' then 'Processing' when 'VT-DONE' then 'Completed' when 'VT-DEC' then 'Declined' else new.status end||'.';
  insert into public.customer_notifications(user_id,transaction_id,reference,event_type,title,message,status) values(new.customer_id,new.id,new.reference,k,t,m,new.status);
 end if;
 return new;
end; $$;
drop trigger if exists transactions_notify_customer_insert on public.transactions;
create trigger transactions_notify_customer_insert after insert on public.transactions for each row execute function public.notify_customer_trade_event();
drop trigger if exists transactions_notify_customer_status on public.transactions;
create trigger transactions_notify_customer_status after update of status on public.transactions for each row execute function public.notify_customer_trade_event();