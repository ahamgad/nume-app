import { describe, expect, it } from "vitest";

import {
  firstEligibleDailyPayoutDateAfter,
  isEgyptianWeekend,
  isEligibleDailyPayoutDate,
  iterateEligibleDailyPayoutDates,
  nextEligibleDailyPayoutDateAfter,
} from "@/lib/business-days/calendar";
import { DEFAULT_BUSINESS_DAY_SETTINGS } from "@/lib/business-days/types";

describe("isEgyptianWeekend", () => {
  it("treats Friday and Saturday as weekend", () => {
    expect(isEgyptianWeekend("2026-01-16")).toBe(true);
    expect(isEgyptianWeekend("2026-01-17")).toBe(true);
    expect(isEgyptianWeekend("2026-01-18")).toBe(false);
  });
});

describe("isEligibleDailyPayoutDate", () => {
  const holidays = new Set(["2026-01-25"]);

  it("allows every calendar day when both toggles are off", () => {
    expect(
      isEligibleDailyPayoutDate(
        "2026-01-16",
        { excludeWeekends: false, excludeEgyptianHolidays: false },
        holidays,
      ),
    ).toBe(true);
  });

  it("skips Friday and Saturday when excludeWeekends is on", () => {
    expect(
      isEligibleDailyPayoutDate(
        "2026-01-16",
        { excludeWeekends: true, excludeEgyptianHolidays: false },
        holidays,
      ),
    ).toBe(false);
    expect(
      isEligibleDailyPayoutDate(
        "2026-01-18",
        { excludeWeekends: true, excludeEgyptianHolidays: false },
        holidays,
      ),
    ).toBe(true);
  });

  it("skips observed holidays when excludeEgyptianHolidays is on", () => {
    expect(
      isEligibleDailyPayoutDate(
        "2026-01-25",
        { excludeWeekends: false, excludeEgyptianHolidays: true },
        holidays,
      ),
    ).toBe(false);
    expect(
      isEligibleDailyPayoutDate(
        "2026-01-26",
        { excludeWeekends: false, excludeEgyptianHolidays: true },
        holidays,
      ),
    ).toBe(true);
  });

  it("applies both weekend and holiday rules together", () => {
    expect(
      isEligibleDailyPayoutDate(
        "2026-01-16",
        DEFAULT_BUSINESS_DAY_SETTINGS,
        holidays,
      ),
    ).toBe(false);
    expect(
      isEligibleDailyPayoutDate(
        "2026-01-25",
        DEFAULT_BUSINESS_DAY_SETTINGS,
        holidays,
      ),
    ).toBe(false);
    expect(
      isEligibleDailyPayoutDate(
        "2026-01-26",
        DEFAULT_BUSINESS_DAY_SETTINGS,
        holidays,
      ),
    ).toBe(true);
  });
});

describe("iterateEligibleDailyPayoutDates", () => {
  it("returns consecutive calendar days when business rules are disabled", () => {
    const dates = iterateEligibleDailyPayoutDates(
      "2026-01-15",
      "2026-01-20",
      { excludeWeekends: false, excludeEgyptianHolidays: false },
      new Set(),
    );
    expect(dates).toEqual([
      "2026-01-16",
      "2026-01-17",
      "2026-01-18",
      "2026-01-19",
      "2026-01-20",
    ]);
  });

  it("skips weekends for catch-up ranges", () => {
    const dates = iterateEligibleDailyPayoutDates(
      "2026-01-15",
      "2026-01-22",
      DEFAULT_BUSINESS_DAY_SETTINGS,
      new Set(),
    );
    expect(dates).toEqual([
      "2026-01-18",
      "2026-01-19",
      "2026-01-20",
      "2026-01-21",
      "2026-01-22",
    ]);
  });

  it("skips holidays in addition to weekends", () => {
    const dates = iterateEligibleDailyPayoutDates(
      "2026-01-15",
      "2026-01-22",
      DEFAULT_BUSINESS_DAY_SETTINGS,
      new Set(["2026-01-19"]),
    );
    expect(dates).toEqual([
      "2026-01-18",
      "2026-01-20",
      "2026-01-21",
      "2026-01-22",
    ]);
  });
});

describe("firstEligibleDailyPayoutDateAfter", () => {
  it("finds the next business day after purchase", () => {
    expect(
      firstEligibleDailyPayoutDateAfter(
        "2026-01-15",
        DEFAULT_BUSINESS_DAY_SETTINGS,
        new Set(),
      ),
    ).toBe("2026-01-18");
  });

  it("advances one eligible day at a time", () => {
    expect(
      nextEligibleDailyPayoutDateAfter(
        "2026-01-18",
        DEFAULT_BUSINESS_DAY_SETTINGS,
        new Set(),
      ),
    ).toBe("2026-01-19");
    expect(
      nextEligibleDailyPayoutDateAfter(
        "2026-01-22",
        DEFAULT_BUSINESS_DAY_SETTINGS,
        new Set(),
      ),
    ).toBe("2026-01-25");
  });
});
