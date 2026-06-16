/** Daily payout/posting business-day configuration (Egypt-first). */
export interface BusinessDaySettings {
  excludeWeekends: boolean;
  excludeEgyptianHolidays: boolean;
}

export const DEFAULT_BUSINESS_DAY_SETTINGS: BusinessDaySettings = {
  excludeWeekends: true,
  excludeEgyptianHolidays: true,
};

export interface DailyBusinessDayContext {
  settings: BusinessDaySettings;
  observedHolidayDates: ReadonlySet<string>;
}

export interface EgyptianHolidayRow {
  date: string;
  name: string;
  isObserved: boolean;
  updatedAt: string;
}

export interface HolidaySyncResult {
  synced: boolean;
  upsertedCount: number;
  error?: string;
}
