import type { SupabaseClient } from "@supabase/supabase-js";

import type { EgyptianHolidayRow, HolidaySyncResult } from "@/lib/business-days/types";
import { fetchEgyptianHolidayEventsFromGoogle } from "@/lib/business-days/holiday-ical";

const SYNC_STATE_ID = "egyptian_google";
const SYNC_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000;

interface DbHolidayRow {
  date: string;
  name: string;
  is_observed: boolean;
  updated_at: string;
}

export function mapEgyptianHolidayRow(row: DbHolidayRow): EgyptianHolidayRow {
  return {
    date: row.date,
    name: row.name,
    isObserved: row.is_observed,
    updatedAt: row.updated_at,
  };
}

export function dedupeHolidayEventsByDate(
  events: ReadonlyArray<{ date: string; name: string }>,
): Array<{ date: string; name: string }> {
  const byDate = new Map<string, string>();
  for (const event of events) {
    byDate.set(event.date, event.name);
  }
  return [...byDate.entries()].map(([date, name]) => ({ date, name }));
}

/** Loads observed holiday ISO dates for engine calculations. Best-effort on failure. */
export async function loadObservedHolidayDatesSafe(
  supabase: SupabaseClient,
): Promise<ReadonlySet<string>> {
  try {
    const { data, error } = await supabase
      .from("egyptian_holidays")
      .select("date")
      .eq("is_observed", true);

    if (error) throw error;

    return new Set((data ?? []).map((row) => row.date as string));
  } catch {
    return new Set<string>();
  }
}

export async function shouldRunHolidaySync(
  supabase: SupabaseClient,
  now = Date.now(),
): Promise<boolean> {
  const { data } = await supabase
    .from("holiday_sync_state")
    .select("last_success_at")
    .eq("id", SYNC_STATE_ID)
    .maybeSingle();

  if (!data?.last_success_at) return true;

  const lastSuccess = new Date(data.last_success_at as string).getTime();
  return now - lastSuccess >= SYNC_INTERVAL_MS;
}

export async function syncEgyptianHolidaysFromGoogle(
  supabase: SupabaseClient,
  options?: { force?: boolean; fetchImpl?: typeof fetch },
): Promise<HolidaySyncResult> {
  const nowIso = new Date().toISOString();

  if (!options?.force) {
    const due = await shouldRunHolidaySync(supabase);
    if (!due) {
      return { synced: false, upsertedCount: 0 };
    }
  }

  await supabase.from("holiday_sync_state").upsert({
    id: SYNC_STATE_ID,
    last_attempt_at: nowIso,
    updated_at: nowIso,
  });

  try {
    const events = dedupeHolidayEventsByDate(
      await fetchEgyptianHolidayEventsFromGoogle(options?.fetchImpl),
    );
    const payload = events.map((event) => ({
      date: event.date,
      name: event.name,
      is_observed: true,
      updated_at: nowIso,
    }));

    if (payload.length > 0) {
      const { error: upsertError } = await supabase
        .from("egyptian_holidays")
        .upsert(payload, { onConflict: "date" });

      if (upsertError) throw upsertError;
    }

    await supabase.from("holiday_sync_state").upsert({
      id: SYNC_STATE_ID,
      last_attempt_at: nowIso,
      last_success_at: nowIso,
      last_error: null,
      updated_at: nowIso,
    });

    return { synced: true, upsertedCount: payload.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Holiday sync failed";

    await supabase.from("holiday_sync_state").upsert({
      id: SYNC_STATE_ID,
      last_attempt_at: nowIso,
      last_error: message,
      updated_at: nowIso,
    });

    return { synced: false, upsertedCount: 0, error: message };
  }
}

/** Non-blocking best-effort sync — never throws. */
export async function syncEgyptianHolidaysIfDue(
  supabase: SupabaseClient,
): Promise<void> {
  try {
    await syncEgyptianHolidaysFromGoogle(supabase);
  } catch {
    // Best effort — engines continue with weekends-only when holiday data is stale.
  }
}
