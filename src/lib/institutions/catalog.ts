import type { AccountType } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";

export type InstitutionCategory = "bank" | "financial_service";

export type InstitutionPickerContext = Extract<
  AccountType,
  "current_account" | "cash" | "wallet" | "certificate"
>;

export interface InstitutionCatalogEntry {
  id: string;
  category: InstitutionCategory;
  /** Display shortcut shown in triggers and list prefixes (e.g. CIB, NBE). */
  shortcut: string;
  /** Stored on `accounts.institution` — canonical English string for catalog picks. */
  storageValue: string;
  /** Localized full institution name. */
  labelKey: TranslationKey;
  /** Legacy / alternate spellings for prefilling existing data. */
  matchValues?: string[];
}

export const OTHER_INSTITUTION_ID = "__other__";

export const INSTITUTION_BANKS: InstitutionCatalogEntry[] = [
  {
    id: "nbe",
    category: "bank",
    shortcut: "NBE",
    storageValue: "National Bank of Egypt",
    labelKey: "institutions.banks.nbe",
    matchValues: ["NBE", "البنك الأهلي المصري"],
  },
  {
    id: "banque_misr",
    category: "bank",
    shortcut: "Banque Misr",
    storageValue: "Banque Misr",
    labelKey: "institutions.banks.banqueMisr",
    matchValues: ["بنك مصر", "BM"],
  },
  {
    id: "cib",
    category: "bank",
    shortcut: "CIB",
    storageValue: "CIB",
    labelKey: "institutions.banks.cib",
  },
  {
    id: "qnb",
    category: "bank",
    shortcut: "QNB",
    storageValue: "QNB",
    labelKey: "institutions.banks.qnb",
  },
  {
    id: "hsbc",
    category: "bank",
    shortcut: "HSBC",
    storageValue: "HSBC",
    labelKey: "institutions.banks.hsbc",
    matchValues: ["HSBC Egypt"],
  },
  {
    id: "alexbank",
    category: "bank",
    shortcut: "AlexBank",
    storageValue: "AlexBank",
    labelKey: "institutions.banks.alexBank",
  },
  {
    id: "fab",
    category: "bank",
    shortcut: "FAB",
    storageValue: "FAB",
    labelKey: "institutions.banks.fab",
  },
  {
    id: "adib",
    category: "bank",
    shortcut: "ADIB",
    storageValue: "ADIB",
    labelKey: "institutions.banks.adib",
  },
  {
    id: "aaib",
    category: "bank",
    shortcut: "AAIB",
    storageValue: "Arab African International Bank",
    labelKey: "institutions.banks.aaib",
    matchValues: ["AAIB", "البنك العربي الأفريقي الدولي"],
  },
];

export const INSTITUTION_FINANCIAL_SERVICES: InstitutionCatalogEntry[] = [
  {
    id: "thndr",
    category: "financial_service",
    shortcut: "Thndr",
    storageValue: "Thndr",
    labelKey: "institutions.financialServices.thndr",
  },
  {
    id: "klivvr",
    category: "financial_service",
    shortcut: "Klivvr",
    storageValue: "Klivvr",
    labelKey: "institutions.financialServices.klivvr",
  },
  {
    id: "souhoula",
    category: "financial_service",
    shortcut: "Souhoula",
    storageValue: "Souhoula",
    labelKey: "institutions.financialServices.souhoula",
  },
  {
    id: "valu",
    category: "financial_service",
    shortcut: "ValU",
    storageValue: "ValU",
    labelKey: "institutions.financialServices.valu",
  },
  {
    id: "contact",
    category: "financial_service",
    shortcut: "Contact",
    storageValue: "Contact",
    labelKey: "institutions.financialServices.contact",
  },
  {
    id: "mnt_halan",
    category: "financial_service",
    shortcut: "MNT-Halan",
    storageValue: "MNT-Halan",
    labelKey: "institutions.financialServices.mntHalan",
  },
  {
    id: "telda",
    category: "financial_service",
    shortcut: "Telda",
    storageValue: "Telda",
    labelKey: "institutions.financialServices.telda",
  },
  {
    id: "bokra",
    category: "financial_service",
    shortcut: "Bokra",
    storageValue: "Bokra",
    labelKey: "institutions.financialServices.bokra",
  },
  {
    id: "fawry",
    category: "financial_service",
    shortcut: "Fawry",
    storageValue: "Fawry",
    labelKey: "institutions.financialServices.fawry",
  },
  {
    id: "lucky",
    category: "financial_service",
    shortcut: "Lucky",
    storageValue: "Lucky",
    labelKey: "institutions.financialServices.lucky",
  },
];

export const ALL_INSTITUTIONS: InstitutionCatalogEntry[] = [
  ...INSTITUTION_BANKS,
  ...INSTITUTION_FINANCIAL_SERVICES,
];

export function getAllowedCategories(
  context: InstitutionPickerContext,
): InstitutionCategory[] {
  switch (context) {
    case "current_account":
      return ["bank", "financial_service"];
    case "wallet":
      return ["financial_service"];
    case "certificate":
      return ["bank"];
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

/** List / details: `SHORTCUT · Full Name` (localized) for catalog entries. */
export function formatInstitutionDisplay(
  value: string,
  t: InstitutionTranslator,
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const match = matchInstitutionEntryGlobal(trimmed, t);
  if (match) {
    return `${match.shortcut} · ${t(match.labelKey)}`;
  }
  return trimmed;
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
