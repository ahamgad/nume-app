import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildDailyBusinessDayContext,
  usesBusinessDayRules,
} from "@/lib/business-days/calendar";
import { loadObservedHolidayDatesSafe } from "@/lib/business-days/holiday-sync";
import type { DailyBusinessDayContext } from "@/lib/business-days/types";
import type { BusinessDaySettings } from "@/lib/business-days/types";
import type { SavingsAccount } from "@/lib/savings/types";

export function savingsBusinessDaySettings(
  savings: Pick<SavingsAccount, "excludeWeekends" | "excludeEgyptianHolidays">,
): BusinessDaySettings {
  return {
    excludeWeekends: savings.excludeWeekends,
    excludeEgyptianHolidays: savings.excludeEgyptianHolidays,
  };
}

export async function resolveSavingsDailyContext(
  supabase: SupabaseClient,
  savings: SavingsAccount,
): Promise<DailyBusinessDayContext | undefined> {
  if (savings.postingFrequency !== "daily") return undefined;

  const settings = savingsBusinessDaySettings(savings);
  if (!usesBusinessDayRules(settings)) return undefined;

  const observedHolidayDates = savings.excludeEgyptianHolidays
    ? await loadObservedHolidayDatesSafe(supabase)
    : new Set<string>();

  return buildDailyBusinessDayContext(settings, observedHolidayDates);
}
