import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const incomingUrl = request.url;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const token = searchParams.get("token");
  const next = searchParams.get("next") ?? "/splash";
  const appUrl = getAppUrl();

  // Do not exchange/verify on the server: email clients and link scanners can
  // consume one-time tokens before the user opens the app. We forward the token
  // to /splash and complete the exchange in the user's browser instead.
  if (!code && !tokenHash) {
    // Temporary verification trace: capture exactly what Supabase redirects to /auth/callback.
    console.info("[AUTH-CALLBACK]", {
      incomingUrl,
      params: Array.from(searchParams.entries()),
      hasCode: Boolean(code),
      hasTokenHash: Boolean(tokenHash),
      hasToken: Boolean(token),
      hasOnlyToken: Boolean(token) && !code && !tokenHash,
      redirectDestination: `${appUrl}/login?error=auth_callback`,
    });
    return NextResponse.redirect(`${appUrl}/login?error=auth_callback`);
  }

  const destination = next.startsWith("/") ? next : `/${next}`;

  const redirectUrl = new URL(`${appUrl}${destination}`);
  searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value);
  });
  // Temporary verification trace: capture redirect destination and full params.
  console.info("[AUTH-CALLBACK]", {
    incomingUrl,
    params: Array.from(searchParams.entries()),
    hasCode: Boolean(code),
    hasTokenHash: Boolean(tokenHash),
    hasToken: Boolean(token),
    hasOnlyToken: Boolean(token) && !code && !tokenHash,
    redirectDestination: redirectUrl.toString(),
  });
  return NextResponse.redirect(redirectUrl.toString());
}
