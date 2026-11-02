-- VersusTrade transaction archives and independent admin activity log
alter table public.transactions
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid;

create index if not exists transactions_archived_at_created_at_idx
  on public.transactions (archived_at, created_at desc);

create table if not exists public.admin_activity (
  id uuid primary key default gen_random_uuid(),
  reference text not null,
  event_type text not null check (event_type in ('ARCHIVED','RESTORED','DELETED')),
  actor_user_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_created_at_idx
  on public.admin_activity (created_at desc);

create index if not exists admin_activity_reference_idx
  on public.admin_activity (reference);

alter table public.admin_activity enable row level security;
revoke all on public.admin_activity from anon, authenticated;
grant all on public.admin_activity to service_role;
