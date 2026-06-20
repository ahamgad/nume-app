export type InstitutionBrandAssetStatus = "available" | "fallback";

/** Recognition tier — D is fallback-only. */
export type InstitutionBrandAssetTier = "A" | "B" | "C" | "D";

export type InstitutionBrandAssetFormat = "png" | "svg";

/**
 * Institution brand asset record — maps registry IDs to static assets.
 * Assets may be app icons (Tier A), brand marks (B), compact logos (C), or fallback (D).
 */
export interface InstitutionBrandAssetEntry {
  readonly institutionId: string;
  readonly status: InstitutionBrandAssetStatus;
  readonly tier: InstitutionBrandAssetTier;
  /** Public path when status is `available`; null for fallback. */
  readonly assetPath: string | null;
  readonly assetFormat?: InstitutionBrandAssetFormat;
  readonly isOfficial?: boolean;
  readonly lastUpdated?: string;
  readonly source?: string;
}
