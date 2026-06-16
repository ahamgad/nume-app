import { NextResponse } from "next/server";

import { syncEgyptianHolidaysFromGoogle } from "@/lib/business-days/holiday-sync";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

/** Cron entry point — Google Calendar → local egyptian_holidays table. */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const result = await syncEgyptianHolidaysFromGoogle(supabase, { force: true });

  return NextResponse.json(result);
}
