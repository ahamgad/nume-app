import type { AuthResponse } from "@supabase/supabase-js";

import type { AuthErrorCode } from "@/lib/auth/errors";
import { mapSupabaseAuthError } from "@/lib/auth/errors";

export function resolveSignUpResult(
  response: AuthResponse,
): { error: AuthErrorCode | null } {
  if (response.error) {
    return { error: mapSupabaseAuthError(response.error) };
  }

  // Supabase returns an empty identities array when the email is already registered.
  if (response.data.user?.identities?.length === 0) {
    return { error: "emailInUse" };
  }

  if (!response.data.user) {
    return { error: "generic" };
  }

  return { error: null };
}
