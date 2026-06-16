/** Parse VEVENT blocks from a Google Calendar public iCal feed. */
export function parseIcsHolidayEvents(
  icsContent: string,
): Array<{ date: string; name: string }> {
  const events: Array<{ date: string; name: string }> = [];
  const blocks = icsContent.split("BEGIN:VEVENT");

  for (const block of blocks.slice(1)) {
    const dtStart = block.match(/^DTSTART(?:;VALUE=DATE)?:(\d{8})/m);
    if (!dtStart) continue;

    const raw = dtStart[1];
    const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;

    const summaryMatch = block.match(/^SUMMARY:(.+)$/m);
    const name = (summaryMatch?.[1] ?? "Holiday")
      .replace(/\\,/g, ",")
      .replace(/\\n/g, " ")
      .trim();

    events.push({ date, name });
  }

  return events;
}

export const DEFAULT_EGYPTIAN_HOLIDAYS_ICAL_URL =
  "https://calendar.google.com/calendar/ical/en.eg%23holiday%40group.v.calendar.google.com/public/basic.ics";

export function resolveEgyptianHolidaysIcalUrl(): string {
  return (
    process.env.EGYPTIAN_HOLIDAYS_ICAL_URL?.trim() ||
    DEFAULT_EGYPTIAN_HOLIDAYS_ICAL_URL
  );
}

export async function fetchEgyptianHolidayEventsFromGoogle(
  fetchImpl: typeof fetch = fetch,
): Promise<Array<{ date: string; name: string }>> {
  const response = await fetchImpl(resolveEgyptianHolidaysIcalUrl(), {
    headers: { Accept: "text/calendar" },
  });

  if (!response.ok) {
    throw new Error(`Holiday feed returned ${response.status}`);
  }

  const icsContent = await response.text();
  return parseIcsHolidayEvents(icsContent);
}
