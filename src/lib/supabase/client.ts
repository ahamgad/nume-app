import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  hasSupabaseEnv,
} from "@/lib/supabase/env";

let browserClient: SupabaseClient | undefined;

export function createClient() {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local",
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
  }

  return browserClient;
}
