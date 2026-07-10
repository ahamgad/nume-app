import { mapSupabaseAuthError, type MappedAuthError } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";

export async function sendEmailOtp(
  email: string,
): Promise<{ error: MappedAuthError | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  return { error: error ? mapSupabaseAuthError(error) : null };
}

export async function verifyEmailOtp(
  email: string,
  token: string,
): Promise<{ error: MappedAuthError | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  return { error: error ? mapSupabaseAuthError(error) : null };
}
