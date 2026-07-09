import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/splash";
  const appUrl = getAppUrl();

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Some clients (prefetchers / link scanners) may hit the callback twice.
      // If the session is already established, treat this as success and keep
      // the flow going rather than showing an "expired" message.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.redirect(`${appUrl}/login?error=auth_callback`);
      }
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.redirect(`${appUrl}/login?error=auth_callback`);
      }
    }
  } else {
    return NextResponse.redirect(`${appUrl}/login?error=auth_callback`);
  }

  const destination = next.startsWith("/") ? next : `/${next}`;

  return NextResponse.redirect(`${appUrl}${destination}`);
}
