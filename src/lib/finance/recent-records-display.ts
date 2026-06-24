/** Whether the Recent Records section should render on account detail screens. */
/** Maximum records shown on account details before "View all". */
export const ACCOUNT_DETAILS_RECENT_RECORDS_LIMIT = 3;

export function shouldShowRecentRecordsSection(
  isArchived: boolean,
  recordCount: number,
): boolean {
  if (recordCount > 0) return true;
  return !isArchived;
}
