import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  const appUrl = getAppUrl();

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${appUrl}/login?error=auth_callback`);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      return NextResponse.redirect(`${appUrl}/login?error=auth_callback`);
    }
  } else {
    return NextResponse.redirect(`${appUrl}/login?error=auth_callback`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let destination = next.startsWith("/") ? next : `/${next}`;
  if (user?.email_confirmed_at && destination === "/") {
    // After confirming email, we show a dedicated success screen which will
    // redirect the user to sign in.
    destination = "/email-verified";
  }

  return NextResponse.redirect(`${appUrl}${destination}`);
}
