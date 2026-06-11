-- NUME Phase 2: accounts + records with RLS
-- Run in Supabase SQL Editor or via Supabase CLI

-- Accounts
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_type text not null check (
    account_type in (
      'current_account',
      'cash',
      'wallet',
      'savings_account',
      'certificate',
      'gold',
      'stocks',
      'loan',
      'credit_card'
    )
  ),
  name text not null,
  institution text,
  current_balance numeric(18, 2) not null default 0,
  include_in_net_worth boolean not null default true,
  include_in_emergency_fund boolean not null default false,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists accounts_user_id_idx on public.accounts (user_id);
create index if not exists accounts_user_status_idx on public.accounts (user_id, status);

-- Records (audit layer)
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  record_type text not null check (
    record_type in ('income', 'expense', 'transfer', 'adjustment', 'system')
  ),
  amount numeric(18, 2) not null,
  description text,
  record_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists records_user_id_idx on public.records (user_id);
create index if not exists records_account_id_idx on public.records (account_id);
create index if not exists records_created_at_idx on public.records (created_at desc);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists accounts_updated_at on public.accounts;
create trigger accounts_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.accounts enable row level security;
alter table public.records enable row level security;

-- Grants (authenticated role needs explicit table access when created via SQL)
grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on table public.accounts to authenticated;
grant all on table public.records to authenticated;

grant all on table public.accounts to service_role;
grant all on table public.records to service_role;

-- Accounts policies
create policy "accounts_select_own"
  on public.accounts for select
  using (auth.uid() = user_id);

create policy "accounts_insert_own"
  on public.accounts for insert
  with check (auth.uid() = user_id);

create policy "accounts_update_own"
  on public.accounts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "accounts_delete_own"
  on public.accounts for delete
  using (auth.uid() = user_id);

-- Records policies
create policy "records_select_own"
  on public.records for select
  using (auth.uid() = user_id);

create policy "records_insert_own"
  on public.records for insert
  with check (auth.uid() = user_id);

create policy "records_update_own"
  on public.records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "records_delete_own"
  on public.records for delete
  using (auth.uid() = user_id);
