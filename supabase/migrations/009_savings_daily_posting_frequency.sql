-- Add daily interest posting frequency for savings accounts

do $$ begin
  alter type public.savings_posting_frequency add value if not exists 'daily';
exception
  when duplicate_object then null;
end $$;
