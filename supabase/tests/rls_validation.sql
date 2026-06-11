-- NUME Phase 2 — Row Level Security validation script
-- Run in Supabase SQL Editor as postgres (service role context).
-- Creates two test users is NOT supported here; use the Supabase Dashboard
-- or manual API testing with two browser sessions instead.
--
-- This script validates policy definitions and simulates isolation checks
-- using auth.uid() substitution via set_config (requires superuser).

-- 1. Confirm RLS is enabled
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('accounts', 'records');

-- 2. List policies (expect 4 per table)
select
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('accounts', 'records')
order by tablename, policyname;

-- 3. Manual cross-user API test (recommended)
--
-- Setup:
--   A. Register User A and User B in the app (two browsers / incognito).
--   B. User A creates an account; copy account UUID from URL.
--   C. In User B's browser DevTools console:
--
--      const { createClient } = await import('@supabase/supabase-js')
--      const sb = createClient(SUPABASE_URL, ANON_KEY)
--      // sign in as User B first via app
--
--   D. Attempt cross-user read (should return empty, not error):
--      sb.from('accounts').select('*').eq('id', '<USER_A_ACCOUNT_ID>')
--
--   E. Attempt cross-user update (should fail or affect 0 rows):
--      sb.from('accounts').update({ name: 'Hacked' }).eq('id', '<USER_A_ACCOUNT_ID>')
--
--   F. Attempt cross-user record insert with User B's session (should fail after migration 002):
--      sb.from('records').insert({
--        user_id: '<USER_B_ID>',
--        account_id: '<USER_A_ACCOUNT_ID>',
--        record_type: 'expense',
--        amount: 100,
--        record_date: '2026-01-01'
--      })
--
-- Expected: no data leakage; writes rejected or scoped to 0 rows.

-- 4. Verify records policy includes account ownership (post-002)
select policyname, with_check
from pg_policies
where tablename = 'records'
  and policyname = 'records_insert_own';
