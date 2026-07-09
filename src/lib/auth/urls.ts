import { getAppUrl } from "@/lib/supabase/env";

export function getAuthCallbackUrl(next: string) {
  const path = next.startsWith("/") ? next : `/${next}`;
  return `${getAppUrl()}/auth/callback?next=${encodeURIComponent(path)}`;
}
