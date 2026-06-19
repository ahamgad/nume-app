export type InstitutionLogoStatus = "available" | "fallback";

/**
 * Institution logo record — maps registry IDs to static assets.
 * Optional metadata (isOfficial, lastUpdated) reserved for future use.
 */
export interface InstitutionLogoEntry {
  readonly institutionId: string;
  readonly status: InstitutionLogoStatus;
  /** Public path when status is `available`; null for fallback. */
  readonly logoPath: string | null;
  readonly isOfficial?: boolean;
  readonly lastUpdated?: string;
}
