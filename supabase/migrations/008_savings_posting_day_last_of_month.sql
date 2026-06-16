-- Allow posting_day = 0 to represent "last day of month"

alter table public.savings_accounts
  drop constraint if exists savings_accounts_posting_day_check;

alter table public.savings_accounts
  add constraint savings_accounts_posting_day_check
  check (posting_day between 0 and 28);
