-- NUME Phase 2 hotfix: table grants for authenticated role
-- Safe to re-apply on existing projects (GRANT is idempotent).

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on table public.accounts to authenticated;
grant all on table public.records to authenticated;

grant all on table public.accounts to service_role;
grant all on table public.records to service_role;
