-- Permanent transaction evidence images.
-- Apply in the Supabase SQL Editor before deploying the evidence API Worker.

create table if not exists public.transaction_images (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  transaction_reference text not null,
  customer_id uuid not null references auth.users(id) on delete cascade,
  storage_key text not null unique,
  original_filename text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  source text not null check (source in ('customer_upload', 'admin_upload', 'chatwoot')),
  chatwoot_conversation_id text,
  chatwoot_message_id text,
  chatwoot_attachment_id text,
  uploaded_by uuid references auth.users(id) on delete set null,
  description text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists transaction_images_transaction_idx
  on public.transaction_images (transaction_id, created_at desc)
  where deleted_at is null;
create index if not exists transaction_images_customer_idx
  on public.transaction_images (customer_id, created_at desc)
  where deleted_at is null;
create unique index if not exists transaction_images_chat_attachment_unique
  on public.transaction_images (transaction_id, chatwoot_attachment_id)
  where chatwoot_attachment_id is not null and deleted_at is null;

alter table public.transaction_images enable row level security;

drop policy if exists "Customers can view evidence for completed own transactions" on public.transaction_images;
create policy "Customers can view evidence for completed own transactions"
on public.transaction_images for select to authenticated
using (
  customer_id = auth.uid()
  and deleted_at is null
  and exists (
    select 1 from public.transactions t
    where t.id = transaction_images.transaction_id
      and t.customer_id = auth.uid()
      and t.status = 'VT-DONE'
      and t.archived_at is null
  )
);

-- No client INSERT/UPDATE/DELETE policies: all writes go through the authenticated
-- evidence Worker using the service role after customer/admin authorization.
