-- NUME Phase 3.1b.1: certificates configuration (1:1 with accounts)
-- Run after 003_grants_authenticated.sql
--
-- SAFETY: This migration is additive only. It must NOT alter, delete, or hide
-- existing rows in public.accounts or public.records.

create type public.certificate_payout_frequency as enum (
  'monthly',
  'quarterly',
  'semi_annual',
  'annual',
  'at_maturity'
);

create type public.certificate_status as enum (
  'active',
  'matured',
  'archived'
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null unique references public.accounts (id) on delete cascade,
  principal_amount numeric(18, 2) not null check (principal_amount >= 0),
  annual_interest_rate numeric(8, 4) not null check (annual_interest_rate >= 0),
  purchase_date date not null,
  term_months integer not null check (term_months > 0),
  maturity_date date not null,
  payout_frequency public.certificate_payout_frequency not null,
  destination_account_id uuid references public.accounts (id) on delete set null,
  auto_apply boolean not null default false,
  status public.certificate_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (maturity_date >= purchase_date)
);

create index if not exists certificates_user_id_idx on public.certificates (user_id);
create index if not exists certificates_account_id_idx on public.certificates (account_id);
create index if not exists certificates_user_status_idx on public.certificates (user_id, status);

drop trigger if exists certificates_updated_at on public.certificates;
create trigger certificates_updated_at
  before update on public.certificates
  for each row execute function public.set_updated_at();

alter table public.certificates enable row level security;

grant all on table public.certificates to authenticated;
grant all on table public.certificates to service_role;

-- SELECT
create policy "certificates_select_own"
  on public.certificates for select
  using (auth.uid() = user_id);

-- INSERT: own user, linked account owned by user, optional destination owned by user
create policy "certificates_insert_own"
  on public.certificates for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.accounts
      where id = account_id
        and user_id = auth.uid()
    )
    and (
      destination_account_id is null
      or exists (
        select 1
        from public.accounts
        where id = destination_account_id
          and user_id = auth.uid()
      )
    )
  );

-- UPDATE
create policy "certificates_update_own"
  on public.certificates for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.accounts
      where id = account_id
        and user_id = auth.uid()
    )
    and (
      destination_account_id is null
      or exists (
        select 1
        from public.accounts
        where id = destination_account_id
          and user_id = auth.uid()
      )
    )
  );

-- DELETE
create policy "certificates_delete_own"
  on public.certificates for delete
  using (auth.uid() = user_id);
