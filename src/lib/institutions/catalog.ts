import type { AccountType } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";
import {
  INSTITUTION_REGISTRY,
  INSTITUTION_REGISTRY_BANKS,
  INSTITUTION_REGISTRY_FINANCIAL_SERVICES,
} from "@/lib/institutions/registry";
import { institutionRegistryLabelKey } from "@/lib/institutions/registry-labels";
import type { InstitutionCategory } from "@/lib/institutions/registry-types";

export type { InstitutionCategory } from "@/lib/institutions/registry-types";
export {
  INSTITUTION_REGISTRY,
  INSTITUTION_REGISTRY_BANKS,
  INSTITUTION_REGISTRY_FINANCIAL_SERVICES,
} from "@/lib/institutions/registry";

export type InstitutionPickerContext = Extract<
  AccountType,
  | "current_account"
  | "cash"
  | "wallet"
  | "certificate"
  | "savings_account"
  | "credit_card"
  | "loan"
>;

export interface InstitutionCatalogEntry {
  id: string;
  category: InstitutionCategory;
  /** Display name shown in triggers and list primary line. */
  shortcut: string;
  /** Stored on `accounts.institution` — canonical short name for catalog picks. */
  storageValue: string;
  /** English full name; localized via {@link labelKey} in the picker. */
  fullName: string;
  /** Localized full institution name (picker line 2). */
  labelKey: TranslationKey;
  /** Legacy / alternate spellings for prefilling existing data. */
  matchValues?: string[];
}

export const OTHER_INSTITUTION_ID = "__other__";

/** Locale-aware ascending sort by consumer-facing short name. */
export function compareInstitutionsByShortName(
  a: Pick<InstitutionCatalogEntry, "shortcut">,
  b: Pick<InstitutionCatalogEntry, "shortcut">,
): number {
  return a.shortcut.localeCompare(b.shortcut, undefined, {
    sensitivity: "base",
    numeric: true,
  });
}

function sortByShortName(
  entries: InstitutionCatalogEntry[],
): InstitutionCatalogEntry[] {
  return [...entries].sort(compareInstitutionsByShortName);
}

function registryEntryToCatalog(
  entry: (typeof INSTITUTION_REGISTRY)[number],
): InstitutionCatalogEntry {
  return {
    id: entry.id,
    category: entry.category,
    shortcut: entry.shortName,
    storageValue: entry.shortName,
    fullName: entry.fullName,
    labelKey: institutionRegistryLabelKey(entry),
    matchValues: entry.matchValues ? [...entry.matchValues] : undefined,
  };
}

export const INSTITUTION_BANKS: InstitutionCatalogEntry[] = sortByShortName(
  INSTITUTION_REGISTRY_BANKS.map(registryEntryToCatalog),
);

export const INSTITUTION_FINANCIAL_SERVICES: InstitutionCatalogEntry[] =
  sortByShortName(INSTITUTION_REGISTRY_FINANCIAL_SERVICES.map(registryEntryToCatalog));

export const ALL_INSTITUTIONS: InstitutionCatalogEntry[] = sortByShortName(
  INSTITUTION_REGISTRY.map(registryEntryToCatalog),
);

export function getAllowedCategories(
  context: InstitutionPickerContext,
): InstitutionCategory[] {
  switch (context) {
    case "current_account":
      return ["bank"];
    case "wallet":
      return ["financial_service"];
    case "certificate":
    case "savings_account":
    case "credit_card":
    case "loan":
      return ["bank", "financial_service"];
    case "cash":
      return [];
  }
}

export function getInstitutionsForContext(
  context: InstitutionPickerContext,
): InstitutionCatalogEntry[] {
  const categories = new Set(getAllowedCategories(context));
  return ALL_INSTITUTIONS.filter((entry) => categories.has(entry.category));
}

export function shouldShowInstitutionPicker(
  context: InstitutionPickerContext,
): boolean {
  return getAllowedCategories(context).length > 0;
}

type InstitutionTranslator = (key: TranslationKey) => string;

export function getInstitutionFullName(
  entry: InstitutionCatalogEntry,
  t: InstitutionTranslator,
): string {
  return t(entry.labelKey);
}

export function getInstitutionShortcut(entry: InstitutionCatalogEntry): string {
  return entry.shortcut;
}

export function matchInstitutionEntry(
  value: string,
  entries: InstitutionCatalogEntry[],
  t: InstitutionTranslator,
): InstitutionCatalogEntry | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toLowerCase();
  for (const entry of entries) {
    if (entry.storageValue.toLowerCase() === normalized) return entry;
    if (entry.shortcut.toLowerCase() === normalized) return entry;
    if (entry.fullName.toLowerCase() === normalized) return entry;
    if (t(entry.labelKey).trim().toLowerCase() === normalized) return entry;
    for (const alias of entry.matchValues ?? []) {
      if (alias.trim().toLowerCase() === normalized) return entry;
    }
  }
  return null;
}

export function matchInstitutionEntryGlobal(
  value: string,
  t: InstitutionTranslator,
): InstitutionCatalogEntry | null {
  return matchInstitutionEntry(value, ALL_INSTITUTIONS, t);
}

export function isOtherInstitutionValue(
  value: string,
  entries: InstitutionCatalogEntry[],
  t: InstitutionTranslator,
): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return matchInstitutionEntry(trimmed, entries, t) === null;
}

export function filterInstitutions(
  entries: InstitutionCatalogEntry[],
  query: string,
  t: InstitutionTranslator,
): InstitutionCatalogEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return entries;

  return entries.filter((entry) => {
    const label = t(entry.labelKey).toLowerCase();
    if (label.includes(normalized)) return true;
    if (entry.shortcut.toLowerCase().includes(normalized)) return true;
    if (entry.storageValue.toLowerCase().includes(normalized)) return true;
    if (entry.fullName.toLowerCase().includes(normalized)) return true;
    return (entry.matchValues ?? []).some((alias) =>
      alias.toLowerCase().includes(normalized),
    );
  });
}

/** Trigger field: shortcut only for catalog entries; custom values as-is. */
export function getInstitutionTriggerLabel(
  value: string,
  context: InstitutionPickerContext,
  t: InstitutionTranslator,
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const entries = getInstitutionsForContext(context);
  const match = matchInstitutionEntry(trimmed, entries, t);
  if (match) return match.shortcut;
  return trimmed;
}

/** List rows: shortcut only for catalog entries; custom values as-is. */
export function formatInstitutionShortcut(
  value: string,
  t: InstitutionTranslator,
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const match = matchInstitutionEntryGlobal(trimmed, t);
  if (match) return match.shortcut;
  return trimmed;
}

/**
 * Canonical read-only institution label — shortcut only.
 * Full names appear only while editing institution information (picker sheets).
 */
export function formatInstitutionEntityLabel(
  value: string,
  t: InstitutionTranslator,
): string {
  return formatInstitutionShortcut(value, t);
}

/** Whether an institution value matches a search query (shortcut or full name). */
export function institutionMatchesSearch(
  value: string,
  query: string,
  t: InstitutionTranslator,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const trimmed = value.trim();
  if (!trimmed) return false;

  if (trimmed.toLowerCase().includes(normalized)) return true;

  const match = matchInstitutionEntryGlobal(trimmed, t);
  if (!match) return false;

  if (match.shortcut.toLowerCase().includes(normalized)) return true;
  if (match.storageValue.toLowerCase().includes(normalized)) return true;
  if (match.fullName.toLowerCase().includes(normalized)) return true;
  if (t(match.labelKey).toLowerCase().includes(normalized)) return true;

  return (match.matchValues ?? []).some((alias) =>
    alias.toLowerCase().includes(normalized),
  );
}

/** Read-only display label — shortcut only. Alias of {@link formatInstitutionEntityLabel}. */
export function formatInstitutionDisplay(
  value: string,
  t: InstitutionTranslator,
): string {
  return formatInstitutionEntityLabel(value, t);
}

/** Props for {@link InstitutionBrandAsset} from a stored institution value. */
export function resolveInstitutionBrandAssetProps(
  institution: string | null | undefined,
  t: InstitutionTranslator,
): { institutionId: string; fallbackLabel: string } | null {
  const trimmed = institution?.trim();
  if (!trimmed) return null;

  const match = matchInstitutionEntryGlobal(trimmed, t);
  return {
    institutionId: match?.id ?? trimmed,
    fallbackLabel: match?.shortcut ?? formatInstitutionEntityLabel(trimmed, t),
  };
}

/** @deprecated Use getInstitutionTriggerLabel or formatInstitutionDisplay. */
export function getInstitutionDisplayLabel(
  value: string,
  context: InstitutionPickerContext,
  t: InstitutionTranslator,
): string | null {
  return getInstitutionTriggerLabel(value, context, t);
}

export function getInstitutionLabel(
  entry: InstitutionCatalogEntry,
  t: InstitutionTranslator,
): string {
  return t(entry.labelKey);
}
