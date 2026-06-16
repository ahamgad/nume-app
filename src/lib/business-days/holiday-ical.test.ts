import { describe, expect, it } from "vitest";

import { parseIcsHolidayEvents } from "@/lib/business-days/holiday-ical";

const SAMPLE_ICS = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260125
SUMMARY:Revolution Day
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260425
SUMMARY:Sinai Liberation Day
END:VEVENT
END:VCALENDAR`;

describe("parseIcsHolidayEvents", () => {
  it("parses Google Calendar holiday VEVENT blocks", () => {
    expect(parseIcsHolidayEvents(SAMPLE_ICS)).toEqual([
      { date: "2026-01-25", name: "Revolution Day" },
      { date: "2026-04-25", name: "Sinai Liberation Day" },
    ]);
  });

  it("returns an empty list for invalid content", () => {
    expect(parseIcsHolidayEvents("not a calendar")).toEqual([]);
  });
});
