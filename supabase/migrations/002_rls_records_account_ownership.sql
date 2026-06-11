-- NUME Phase 2 QA: tighten records RLS to require account ownership
-- Run after 001_phase2_accounts_records.sql

drop policy if exists "records_insert_own" on public.records;
drop policy if exists "records_update_own" on public.records;

create policy "records_insert_own"
  on public.records for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.accounts
      where id = account_id
        and user_id = auth.uid()
    )
  );

create policy "records_update_own"
  on public.records for update
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.accounts
      where id = account_id
        and user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.accounts
      where id = account_id
        and user_id = auth.uid()
    )
  );
