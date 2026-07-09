import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const next = searchParams.get("next") ?? "/splash";
  const appUrl = getAppUrl();

  // Do not exchange/verify on the server: email clients and link scanners can
  // consume one-time tokens before the user opens the app. We forward the token
  // to /splash and complete the exchange in the user's browser instead.
  if (!code && !tokenHash) {
    return NextResponse.redirect(`${appUrl}/login?error=auth_callback`);
  }

  const destination = next.startsWith("/") ? next : `/${next}`;

  const redirectUrl = new URL(`${appUrl}${destination}`);
  searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value);
  });
  return NextResponse.redirect(redirectUrl.toString());
}
