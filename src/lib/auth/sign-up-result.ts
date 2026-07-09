import type { AuthResponse } from "@supabase/supabase-js";

import {
  authError,
  mapSupabaseAuthError,
  type MappedAuthError,
} from "@/lib/auth/errors";

export function resolveSignUpResult(
  response: AuthResponse,
): { error: MappedAuthError | null } {
  if (response.error) {
    return { error: mapSupabaseAuthError(response.error) };
  }

  // Supabase returns an empty identities array when the email is already registered.
  if (response.data.user?.identities?.length === 0) {
    return { error: authError("emailInUse") };
  }

  if (!response.data.user) {
    return { error: authError("generic") };
  }

  return { error: null };
}
