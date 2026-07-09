import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { completeAuthCallback } from "@/lib/auth/complete-auth-callback";
import { getAppUrl } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/splash";
  const appUrl = getAppUrl();

  const destination = next.startsWith("/") ? next : `/${next}`;
  const successUrl = `${appUrl}${destination}`;
  const failureUrl = `${appUrl}/login?error=auth_callback`;

  const successResponse = NextResponse.redirect(successUrl);
  const established = await completeAuthCallback(request, successResponse, {
    code,
    tokenHash,
    type,
  });

  if (established) {
    return successResponse;
  }

  return NextResponse.redirect(failureUrl);
}
