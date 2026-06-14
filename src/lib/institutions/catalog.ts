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
  /** Stored on `accounts.institution` — canonical English string for catalog picks. */
  storageValue: string;
  labelKey: TranslationKey;
  /** Legacy / alternate spellings for prefilling existing data. */
  matchValues?: string[];
}

export const OTHER_INSTITUTION_ID = "__other__";

export const INSTITUTION_BANKS: InstitutionCatalogEntry[] = [
  {
    id: "nbe",
    category: "bank",
    storageValue: "National Bank of Egypt",
    labelKey: "institutions.banks.nbe",
    matchValues: ["NBE", "البنك الأهلي المصري"],
  },
  {
    id: "banque_misr",
    category: "bank",
    storageValue: "Banque Misr",
    labelKey: "institutions.banks.banqueMisr",
    matchValues: ["بنك مصر"],
  },
  {
    id: "cib",
    category: "bank",
    storageValue: "CIB",
    labelKey: "institutions.banks.cib",
  },
  {
    id: "qnb",
    category: "bank",
    storageValue: "QNB",
    labelKey: "institutions.banks.qnb",
  },
  {
    id: "hsbc",
    category: "bank",
    storageValue: "HSBC",
    labelKey: "institutions.banks.hsbc",
    matchValues: ["HSBC Egypt"],
  },
  {
    id: "alexbank",
    category: "bank",
    storageValue: "AlexBank",
    labelKey: "institutions.banks.alexBank",
  },
  {
    id: "fab",
    category: "bank",
    storageValue: "FAB",
    labelKey: "institutions.banks.fab",
  },
  {
    id: "adib",
    category: "bank",
    storageValue: "ADIB",
    labelKey: "institutions.banks.adib",
  },
];

export const INSTITUTION_FINANCIAL_SERVICES: InstitutionCatalogEntry[] = [
  {
    id: "thndr",
    category: "financial_service",
    storageValue: "Thndr",
    labelKey: "institutions.financialServices.thndr",
  },
  {
    id: "klivvr",
    category: "financial_service",
    storageValue: "Klivvr",
    labelKey: "institutions.financialServices.klivvr",
  },
  {
    id: "souhoula",
    category: "financial_service",
    storageValue: "Souhoula",
    labelKey: "institutions.financialServices.souhoula",
  },
  {
    id: "valu",
    category: "financial_service",
    storageValue: "ValU",
    labelKey: "institutions.financialServices.valu",
  },
  {
    id: "contact",
    category: "financial_service",
    storageValue: "Contact",
    labelKey: "institutions.financialServices.contact",
  },
  {
    id: "mnt_halan",
    category: "financial_service",
    storageValue: "MNT-Halan",
    labelKey: "institutions.financialServices.mntHalan",
  },
  {
    id: "telda",
    category: "financial_service",
    storageValue: "Telda",
    labelKey: "institutions.financialServices.telda",
  },
  {
    id: "bokra",
    category: "financial_service",
    storageValue: "Bokra",
    labelKey: "institutions.financialServices.bokra",
  },
  {
    id: "fawry",
    category: "financial_service",
    storageValue: "Fawry",
    labelKey: "institutions.financialServices.fawry",
  },
  {
    id: "lucky",
    category: "financial_service",
    storageValue: "Lucky",
    labelKey: "institutions.financialServices.lucky",
  },
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
  return [...INSTITUTION_BANKS, ...INSTITUTION_FINANCIAL_SERVICES].filter(
    (entry) => categories.has(entry.category),
  );
}

export function shouldShowInstitutionPicker(
  context: InstitutionPickerContext,
): boolean {
  return getAllowedCategories(context).length > 0;
}

type InstitutionTranslator = (key: TranslationKey) => string;

export function getInstitutionLabel(
  entry: InstitutionCatalogEntry,
  t: InstitutionTranslator,
): string {
  return t(entry.labelKey);
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
    if (t(entry.labelKey).trim().toLowerCase() === normalized) return entry;
    for (const alias of entry.matchValues ?? []) {
      if (alias.trim().toLowerCase() === normalized) return entry;
    }
  }
  return null;
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
    if (entry.storageValue.toLowerCase().includes(normalized)) return true;
    return (entry.matchValues ?? []).some((alias) =>
      alias.toLowerCase().includes(normalized),
    );
  });
}

export function getInstitutionDisplayLabel(
  value: string,
  context: InstitutionPickerContext,
  t: InstitutionTranslator,
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const entries = getInstitutionsForContext(context);
  const match = matchInstitutionEntry(trimmed, entries, t);
  if (match) return t(match.labelKey);
  return trimmed;
}
