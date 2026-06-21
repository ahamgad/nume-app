-- Certificate payout day (mirrors savings posting_day semantics: 0 = last day of month)

alter table public.certificates
  add column if not exists payout_day smallint not null default 1
    check (payout_day between 0 and 28);
