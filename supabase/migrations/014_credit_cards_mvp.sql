-- NUME Phase 3.3: Credit Cards MVP

alter table public.credit_cards
  add column if not exists statement_close_day smallint not null default 1
    check (statement_close_day between 1 and 28),
  add column if not exists payment_due_day smallint not null default 15
    check (payment_due_day between 1 and 28),
  add column if not exists credit_limit numeric(18, 2) null
    check (credit_limit is null or credit_limit >= 0);

alter table public.records
  add column if not exists credit_card_id uuid references public.credit_cards (id) on delete set null,
  add column if not exists payment_source_account_id uuid references public.accounts (id) on delete set null;

alter table public.records drop constraint if exists records_record_type_check;
alter table public.records add constraint records_record_type_check check (
  record_type in (
    'income',
    'expense',
    'transfer',
    'adjustment',
    'system',
    'interest',
    'credit_card_purchase',
    'credit_card_payment'
  )
);

create index if not exists records_credit_card_id_idx
  on public.records (credit_card_id);

create index if not exists records_payment_source_account_id_idx
  on public.records (payment_source_account_id);
