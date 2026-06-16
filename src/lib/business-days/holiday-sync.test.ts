import { describe, expect, it, vi } from "vitest";

import {
  dedupeHolidayEventsByDate,
  loadObservedHolidayDatesSafe,
  syncEgyptianHolidaysFromGoogle,
} from "@/lib/business-days/holiday-sync";

const SAMPLE_ICS = `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260125
SUMMARY:Revolution Day
END:VEVENT
END:VCALENDAR`;

function createMockSupabase(options?: {
  holidays?: Array<{ date: string }>;
  syncState?: { last_success_at: string | null } | null;
}) {
  const upsertCalls: Array<{ table: string; payload: unknown }> = [];
  const holidays = options?.holidays ?? [];

  const supabase = {
    from(table: string) {
      return {
        select() {
          return {
            eq(_column: string, _value: unknown) {
              if (table === "egyptian_holidays") {
                return Promise.resolve({ data: holidays, error: null });
              }
              return {
                maybeSingle: async () => ({
                  data: options?.syncState ?? null,
                  error: null,
                }),
              };
            },
            maybeSingle: async () => ({
              data: options?.syncState ?? null,
              error: null,
            }),
          };
        },
        upsert(payload: unknown) {
          upsertCalls.push({ table, payload });
          return Promise.resolve({ error: null });
        },
      };
    },
    _upsertCalls: upsertCalls,
  };

  return supabase;
}

describe("dedupeHolidayEventsByDate", () => {
  it("keeps one entry per holiday date", () => {
    expect(
      dedupeHolidayEventsByDate([
        { date: "2026-01-25", name: "Revolution Day" },
        { date: "2026-01-25", name: "Day off for Revolution Day" },
        { date: "2026-04-25", name: "Sinai Liberation Day" },
      ]),
    ).toEqual([
      { date: "2026-01-25", name: "Day off for Revolution Day" },
      { date: "2026-04-25", name: "Sinai Liberation Day" },
    ]);
  });
});

describe("loadObservedHolidayDatesSafe", () => {
  it("returns observed holiday dates from the local table", async () => {
    const supabase = createMockSupabase({
      holidays: [{ date: "2026-01-25" }, { date: "2026-04-25" }],
    });

    const dates = await loadObservedHolidayDatesSafe(
      supabase as unknown as Parameters<typeof loadObservedHolidayDatesSafe>[0],
    );

    expect(dates.has("2026-01-25")).toBe(true);
    expect(dates.has("2026-04-25")).toBe(true);
  });

  it("falls back to an empty set when the query fails", async () => {
    const supabase = {
      from() {
        return {
          select() {
            return {
              eq() {
                return Promise.resolve({
                  data: null,
                  error: new Error("db unavailable"),
                });
              },
            };
          },
        };
      },
    };

    const dates = await loadObservedHolidayDatesSafe(
      supabase as unknown as Parameters<typeof loadObservedHolidayDatesSafe>[0],
    );

    expect(dates.size).toBe(0);
  });
});

describe("syncEgyptianHolidaysFromGoogle", () => {
  it("upserts holidays on successful synchronization", async () => {
    const supabase = createMockSupabase();
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => SAMPLE_ICS,
    });

    const result = await syncEgyptianHolidaysFromGoogle(
      supabase as unknown as Parameters<typeof syncEgyptianHolidaysFromGoogle>[0],
      { force: true, fetchImpl },
    );

    expect(result.synced).toBe(true);
    expect(result.upsertedCount).toBe(1);
    expect(supabase._upsertCalls.some((call) => call.table === "egyptian_holidays")).toBe(
      true,
    );
  });

  it("does not throw when synchronization fails", async () => {
    const supabase = createMockSupabase();
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });

    const result = await syncEgyptianHolidaysFromGoogle(
      supabase as unknown as Parameters<typeof syncEgyptianHolidaysFromGoogle>[0],
      { force: true, fetchImpl },
    );

    expect(result.synced).toBe(false);
    expect(result.error).toBeTruthy();
    expect(supabase._upsertCalls.some((call) => call.table === "holiday_sync_state")).toBe(
      true,
    );
  });
});
