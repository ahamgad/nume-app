-- Phase 3.1.1: Business Days Engine — Egyptian holidays + daily payout settings

create table if not exists public.egyptian_holidays (
  date date primary key,
  name text not null,
  is_observed boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists egyptian_holidays_observed_idx
  on public.egyptian_holidays (date)
  where is_observed = true;

create table if not exists public.holiday_sync_state (
  id text primary key default 'egyptian_google',
  last_attempt_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  updated_at timestamptz not null default now()
);

insert into public.holiday_sync_state (id)
values ('egyptian_google')
on conflict (id) do nothing;

alter table public.savings_accounts
  add column if not exists exclude_weekends boolean not null default true,
  add column if not exists exclude_egyptian_holidays boolean not null default true;

alter table public.certificates
  add column if not exists exclude_weekends boolean not null default true,
  add column if not exists exclude_egyptian_holidays boolean not null default true;

alter table public.egyptian_holidays enable row level security;

create policy "egyptian_holidays_select_authenticated"
  on public.egyptian_holidays for select
  to authenticated
  using (true);

grant select on table public.egyptian_holidays to authenticated;
grant all on table public.egyptian_holidays to service_role;
grant all on table public.holiday_sync_state to service_role;
