-- NUME Phase 3.2: Certificate recurring engine
-- Interest schedules, processing metadata, renewal configuration
-- Safe for repeated deployment (idempotent patterns throughout)

-- Extend certificate status lifecycle
alter type public.certificate_status add value if not exists 'renewed';
alter type public.certificate_status add value if not exists 'closed';

do $$ begin
  create type public.certificate_renewal_type as enum (
    'none',
    'renew_principal',
    'renew_principal_and_interest'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.certificate_schedule_status as enum (
    'pending',
    'processed',
    'skipped'
  );
exception
  when duplicate_object then null;
end $$;

-- Certificate processing metadata
alter table public.certificates
  add column if not exists next_interest_date date,
  add column if not exists last_interest_processed_at timestamptz,
  add column if not exists renewal_type public.certificate_renewal_type not null default 'none',
  add column if not exists renewed_from_certificate_id uuid references public.certificates (id) on delete set null,
  add column if not exists renewal_processed_at timestamptz,
  add column if not exists renewed_certificate_id uuid references public.certificates (id) on delete set null,
  add column if not exists source_certificate_id uuid references public.certificates (id) on delete set null;

create index if not exists certificates_next_interest_date_idx
  on public.certificates (user_id, next_interest_date)
  where status = 'active';

create index if not exists certificates_renewed_certificate_id_idx
  on public.certificates (renewed_certificate_id)
  where renewed_certificate_id is not null;

create index if not exists certificates_source_certificate_id_idx
  on public.certificates (source_certificate_id)
  where source_certificate_id is not null;

-- Interest schedule entries (persistent projected + processed schedule)
create table if not exists public.certificate_interest_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  certificate_id uuid not null references public.certificates (id) on delete cascade,
  due_date date not null,
  interest_amount numeric(18, 2) not null check (interest_amount >= 0),
  status public.certificate_schedule_status not null default 'pending',
  processed_at timestamptz,
  interest_record_id uuid,
  transfer_failed boolean not null default false,
  transfer_record_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (certificate_id, due_date)
);

create index if not exists certificate_interest_schedules_certificate_idx
  on public.certificate_interest_schedules (certificate_id, due_date);

create index if not exists certificate_interest_schedules_certificate_id_idx
  on public.certificate_interest_schedules (certificate_id);

create index if not exists certificate_interest_schedules_status_idx
  on public.certificate_interest_schedules (status);

create index if not exists certificate_interest_schedules_due_date_idx
  on public.certificate_interest_schedules (due_date);

create index if not exists certificate_interest_schedules_pending_idx
  on public.certificate_interest_schedules (certificate_id, status, due_date)
  where status = 'pending';

drop trigger if exists certificate_interest_schedules_updated_at
  on public.certificate_interest_schedules;
create trigger certificate_interest_schedules_updated_at
  before update on public.certificate_interest_schedules
  for each row execute function public.set_updated_at();

alter table public.certificate_interest_schedules enable row level security;

grant all on table public.certificate_interest_schedules to authenticated;
grant all on table public.certificate_interest_schedules to service_role;

drop policy if exists "certificate_interest_schedules_select_own"
  on public.certificate_interest_schedules;
create policy "certificate_interest_schedules_select_own"
  on public.certificate_interest_schedules for select
  using (auth.uid() = user_id);

drop policy if exists "certificate_interest_schedules_insert_own"
  on public.certificate_interest_schedules;
create policy "certificate_interest_schedules_insert_own"
  on public.certificate_interest_schedules for insert
  with check (auth.uid() = user_id);

drop policy if exists "certificate_interest_schedules_update_own"
  on public.certificate_interest_schedules;
create policy "certificate_interest_schedules_update_own"
  on public.certificate_interest_schedules for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "certificate_interest_schedules_delete_own"
  on public.certificate_interest_schedules;
create policy "certificate_interest_schedules_delete_own"
  on public.certificate_interest_schedules for delete
  using (auth.uid() = user_id);

-- Extend records for interest traceability
alter table public.records
  add column if not exists certificate_id uuid references public.certificates (id) on delete set null,
  add column if not exists schedule_entry_id uuid references public.certificate_interest_schedules (id) on delete set null;

alter table public.records drop constraint if exists records_record_type_check;
alter table public.records add constraint records_record_type_check check (
  record_type in ('income', 'expense', 'transfer', 'adjustment', 'system', 'interest')
);

alter table public.certificate_interest_schedules
  drop constraint if exists certificate_interest_schedules_interest_record_fk;
alter table public.certificate_interest_schedules
  add constraint certificate_interest_schedules_interest_record_fk
  foreign key (interest_record_id) references public.records (id) on delete set null;

alter table public.certificate_interest_schedules
  drop constraint if exists certificate_interest_schedules_transfer_record_fk;
alter table public.certificate_interest_schedules
  add constraint certificate_interest_schedules_transfer_record_fk
  foreign key (transfer_record_id) references public.records (id) on delete set null;

create index if not exists records_certificate_id_idx on public.records (certificate_id);
create index if not exists records_schedule_entry_id_idx on public.records (schedule_entry_id);
create index if not exists records_record_type_idx on public.records (record_type);

-- Prevent duplicate interest records for the same schedule entry (concurrency guard)
create unique index if not exists records_schedule_entry_id_unique_idx
  on public.records (schedule_entry_id)
  where schedule_entry_id is not null;
