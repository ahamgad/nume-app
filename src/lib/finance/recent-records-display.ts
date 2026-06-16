/** Whether the Recent Records section should render on account detail screens. */
export function shouldShowRecentRecordsSection(
  isArchived: boolean,
  recordCount: number,
): boolean {
  if (recordCount > 0) return true;
  return !isArchived;
}
