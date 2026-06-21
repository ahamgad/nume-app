-- NUME Phase 3.2.1: Generic account relationships (Credit Card / Loan native storage)

do $$ begin
  create type public.account_relationship_type as enum (
    'interest_destination',
    'credit_card_payment_source',
    'loan_payment_source'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.account_relationships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_account_id uuid not null references public.accounts (id) on delete cascade,
  target_account_id uuid not null references public.accounts (id) on delete cascade,
  relationship_type public.account_relationship_type not null,
  created_at timestamptz not null default now(),
  constraint account_relationships_no_self_link check (
    source_account_id <> target_account_id
  ),
  constraint account_relationships_unique_source_type unique (
    source_account_id,
    relationship_type
  )
);

create index if not exists account_relationships_user_id_idx
  on public.account_relationships (user_id);

create index if not exists account_relationships_source_idx
  on public.account_relationships (source_account_id);

create index if not exists account_relationships_target_idx
  on public.account_relationships (target_account_id);

alter table public.account_relationships enable row level security;

grant all on table public.account_relationships to authenticated;
grant all on table public.account_relationships to service_role;

create policy "account_relationships_select_own"
  on public.account_relationships for select
  using (auth.uid() = user_id);

create policy "account_relationships_insert_own"
  on public.account_relationships for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.accounts
      where id = source_account_id
        and user_id = auth.uid()
    )
    and exists (
      select 1
      from public.accounts
      where id = target_account_id
        and user_id = auth.uid()
    )
  );

create policy "account_relationships_update_own"
  on public.account_relationships for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.accounts
      where id = source_account_id
        and user_id = auth.uid()
    )
    and exists (
      select 1
      from public.accounts
      where id = target_account_id
        and user_id = auth.uid()
    )
  );

create policy "account_relationships_delete_own"
  on public.account_relationships for delete
  using (auth.uid() = user_id);
