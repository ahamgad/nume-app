import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType, SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export type AuthCallbackParams = {
  code: string | null;
  tokenHash: string | null;
  type: EmailOtpType | null;
};

export async function hasAuthenticatedUser(
  supabase: SupabaseClient,
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(user);
}

/**
 * Exchanges verification/recovery tokens and attaches session cookies to
 * `response`. Returns whether the callback may proceed to `next`.
 */
export async function completeAuthCallback(
  request: NextRequest,
  response: NextResponse,
  params: AuthCallbackParams,
): Promise<boolean> {
  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let exchangeFailed = false;

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    exchangeFailed = Boolean(error);
  } else if (params.tokenHash && params.type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: params.tokenHash,
      type: params.type,
    });
    exchangeFailed = Boolean(error);
  } else {
    exchangeFailed = true;
  }

  if (!exchangeFailed) {
    return true;
  }

  return hasAuthenticatedUser(supabase);
}
