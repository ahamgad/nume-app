-- NUME Phase 3.1: Savings accounts configuration (1:1 with accounts)

do $$ begin
  create type public.savings_interest_model as enum ('fixed', 'tiered');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.savings_posting_frequency as enum (
    'monthly',
    'quarterly',
    'semi_annual',
    'annual'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.savings_interest_destination as enum (
    'same_account',
    'another_account'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.savings_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null unique references public.accounts (id) on delete cascade,
  interest_model public.savings_interest_model not null default 'fixed',
  annual_interest_rate numeric(8, 4) check (annual_interest_rate is null or annual_interest_rate >= 0),
  posting_frequency public.savings_posting_frequency not null,
  posting_day smallint not null check (posting_day between 1 and 28),
  interest_destination public.savings_interest_destination not null default 'same_account',
  destination_account_id uuid references public.accounts (id) on delete set null,
  cycle_start_date date not null,
  cycle_minimum_balance numeric(18, 2) not null default 0 check (cycle_minimum_balance >= 0),
  next_posting_date date,
  last_posting_processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists savings_accounts_user_id_idx
  on public.savings_accounts (user_id);
create index if not exists savings_accounts_account_id_idx
  on public.savings_accounts (account_id);
create index if not exists savings_accounts_next_posting_date_idx
  on public.savings_accounts (user_id, next_posting_date)
  where next_posting_date is not null;

drop trigger if exists savings_accounts_updated_at on public.savings_accounts;
create trigger savings_accounts_updated_at
  before update on public.savings_accounts
  for each row execute function public.set_updated_at();

create table if not exists public.savings_interest_tiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  savings_account_id uuid not null references public.savings_accounts (id) on delete cascade,
  min_balance numeric(18, 2) not null check (min_balance >= 0),
  max_balance numeric(18, 2) check (max_balance is null or max_balance >= min_balance),
  annual_interest_rate numeric(8, 4) not null check (annual_interest_rate >= 0),
  sort_order integer not null check (sort_order >= 0)
);

create index if not exists savings_interest_tiers_account_idx
  on public.savings_interest_tiers (savings_account_id, sort_order);

alter table public.savings_accounts enable row level security;
alter table public.savings_interest_tiers enable row level security;

grant all on table public.savings_accounts to authenticated;
grant all on table public.savings_accounts to service_role;
grant all on table public.savings_interest_tiers to authenticated;
grant all on table public.savings_interest_tiers to service_role;

create policy "savings_accounts_select_own"
  on public.savings_accounts for select
  using (auth.uid() = user_id);

create policy "savings_accounts_insert_own"
  on public.savings_accounts for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.accounts
      where id = account_id and user_id = auth.uid()
    )
  );

create policy "savings_accounts_update_own"
  on public.savings_accounts for update
  using (auth.uid() = user_id);

create policy "savings_interest_tiers_select_own"
  on public.savings_interest_tiers for select
  using (auth.uid() = user_id);

create policy "savings_interest_tiers_insert_own"
  on public.savings_interest_tiers for insert
  with check (auth.uid() = user_id);

create policy "savings_interest_tiers_update_own"
  on public.savings_interest_tiers for update
  using (auth.uid() = user_id);

create policy "savings_interest_tiers_delete_own"
  on public.savings_interest_tiers for delete
  using (auth.uid() = user_id);

alter table public.records
  add column if not exists savings_account_id uuid references public.savings_accounts (id) on delete set null;
