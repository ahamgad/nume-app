export type InstitutionCategory = "bank" | "financial_service";

/**
 * Canonical institution record — single source of truth for NUME.
 * Optional branding fields (logo, brandColor, website) may be added later.
 */
export interface InstitutionRegistryEntry {
  readonly id: string;
  /** Consumer-facing short label; stored on `accounts.institution`. */
  readonly shortName: string;
  /** Full institution name; picker line 2 and localized via i18n. */
  readonly fullName: string;
  readonly category: InstitutionCategory;
  /** Legacy stored values, abbreviations, and search aliases. */
  readonly matchValues?: readonly string[];
}
