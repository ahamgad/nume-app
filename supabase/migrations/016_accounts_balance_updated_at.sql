-- Balance timestamp foundation: accounts.updated_at changes only when current_balance changes.

create or replace function public.set_accounts_updated_at()
returns trigger
language plpgsql
as $$
begin
  if new.current_balance is distinct from old.current_balance then
    new.updated_at = now();
  else
    new.updated_at = old.updated_at;
  end if;
  return new;
end;
$$;

drop trigger if exists accounts_updated_at on public.accounts;
create trigger accounts_updated_at
  before update on public.accounts
  for each row execute function public.set_accounts_updated_at();
