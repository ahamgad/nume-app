import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildDailyBusinessDayContext,
  usesBusinessDayRules,
} from "@/lib/business-days/calendar";
import { loadObservedHolidayDatesSafe } from "@/lib/business-days/holiday-sync";
import type { DailyBusinessDayContext } from "@/lib/business-days/types";
import type { BusinessDaySettings } from "@/lib/business-days/types";
import type { Certificate } from "@/lib/certificates/types";
import type { ScheduleGenerationInput } from "@/lib/certificates/recurring/types";

export function certificateBusinessDaySettings(
  certificate: Pick<Certificate, "excludeWeekends" | "excludeEgyptianHolidays">,
): BusinessDaySettings {
  return {
    excludeWeekends: certificate.excludeWeekends,
    excludeEgyptianHolidays: certificate.excludeEgyptianHolidays,
  };
}

export function scheduleBusinessDaySettings(
  input: Pick<
    ScheduleGenerationInput,
    "excludeWeekends" | "excludeEgyptianHolidays"
  >,
): BusinessDaySettings {
  return {
    excludeWeekends: input.excludeWeekends,
    excludeEgyptianHolidays: input.excludeEgyptianHolidays,
  };
}

export async function resolveCertificateDailyContext(
  supabase: SupabaseClient,
  certificate: Certificate,
): Promise<DailyBusinessDayContext | undefined> {
  if (certificate.payoutFrequency !== "daily") return undefined;

  const settings = certificateBusinessDaySettings(certificate);
  if (!usesBusinessDayRules(settings)) return undefined;

  const observedHolidayDates = certificate.excludeEgyptianHolidays
    ? await loadObservedHolidayDatesSafe(supabase)
    : new Set<string>();

  return buildDailyBusinessDayContext(settings, observedHolidayDates);
}

export async function resolveScheduleDailyContext(
  supabase: SupabaseClient,
  input: ScheduleGenerationInput,
): Promise<DailyBusinessDayContext | undefined> {
  if (input.payoutFrequency !== "daily") return undefined;

  const settings = scheduleBusinessDaySettings(input);
  if (!usesBusinessDayRules(settings)) return undefined;

  const observedHolidayDates = input.excludeEgyptianHolidays
    ? await loadObservedHolidayDatesSafe(supabase)
    : new Set<string>();

  return buildDailyBusinessDayContext(settings, observedHolidayDates);
}

/** Pure context when holiday dates are already loaded (schedule generation/tests). */
export function buildScheduleDailyContext(
  input: Pick<
    ScheduleGenerationInput,
    "payoutFrequency" | "excludeWeekends" | "excludeEgyptianHolidays"
  >,
  observedHolidayDates: ReadonlySet<string> = new Set(),
): DailyBusinessDayContext | undefined {
  if (input.payoutFrequency !== "daily") return undefined;
  const settings = scheduleBusinessDaySettings(input);
  if (!usesBusinessDayRules(settings)) return undefined;
  return buildDailyBusinessDayContext(settings, observedHolidayDates);
}
