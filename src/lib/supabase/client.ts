import { createBrowserClient } from "@supabase/ssr";

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  hasSupabaseEnv,
} from "@/lib/supabase/env";

export function createClient() {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local",
    );
  }
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
