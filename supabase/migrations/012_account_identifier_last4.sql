-- Phase 4: optional last-4 identifier fields for account identification

alter table public.accounts
  add column if not exists account_number_last4 text null
  constraint accounts_account_number_last4_format
    check (account_number_last4 is null or account_number_last4 ~ '^\d{4}$');

alter table public.certificates
  add column if not exists certificate_number_last4 text null
  constraint certificates_certificate_number_last4_format
    check (certificate_number_last4 is null or certificate_number_last4 ~ '^\d{4}$');

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null unique references public.accounts (id) on delete cascade,
  loan_number_last4 text null
    constraint loans_loan_number_last4_format
      check (loan_number_last4 is null or loan_number_last4 ~ '^\d{4}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists loans_user_id_idx on public.loans (user_id);
create index if not exists loans_account_id_idx on public.loans (account_id);

drop trigger if exists loans_updated_at on public.loans;
create trigger loans_updated_at
  before update on public.loans
  for each row execute function public.set_updated_at();

create table if not exists public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null unique references public.accounts (id) on delete cascade,
  card_number_last4 text null
    constraint credit_cards_card_number_last4_format
      check (card_number_last4 is null or card_number_last4 ~ '^\d{4}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists credit_cards_user_id_idx on public.credit_cards (user_id);
create index if not exists credit_cards_account_id_idx on public.credit_cards (account_id);

drop trigger if exists credit_cards_updated_at on public.credit_cards;
create trigger credit_cards_updated_at
  before update on public.credit_cards
  for each row execute function public.set_updated_at();

alter table public.loans enable row level security;
alter table public.credit_cards enable row level security;

grant all on table public.loans to authenticated;
grant all on table public.loans to service_role;
grant all on table public.credit_cards to authenticated;
grant all on table public.credit_cards to service_role;

create policy "loans_select_own"
  on public.loans for select
  using (auth.uid() = user_id);

create policy "loans_insert_own"
  on public.loans for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.accounts
      where id = account_id and user_id = auth.uid()
    )
  );

create policy "loans_update_own"
  on public.loans for update
  using (auth.uid() = user_id);

create policy "credit_cards_select_own"
  on public.credit_cards for select
  using (auth.uid() = user_id);

create policy "credit_cards_insert_own"
  on public.credit_cards for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.accounts
      where id = account_id and user_id = auth.uid()
    )
  );

create policy "credit_cards_update_own"
  on public.credit_cards for update
  using (auth.uid() = user_id);
