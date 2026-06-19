import type { InstitutionRegistryEntry } from "@/lib/institutions/registry-types";
import type { TranslationKey } from "@/lib/i18n";

/** Converts registry id to i18n key segment (e.g. `qnb_alahli` → `qnbAlahli`). */
export function institutionIdToLabelKeyPart(id: string): string {
  return id.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

export function institutionRegistryLabelKey(
  entry: Pick<InstitutionRegistryEntry, "id" | "category">,
): TranslationKey {
  const part = institutionIdToLabelKeyPart(entry.id);
  return (
    entry.category === "bank"
      ? `institutions.banks.${part}`
      : `institutions.financialServices.${part}`
  ) as TranslationKey;
}

export function getInstitutionRegistryEntryById(
  id: string,
  entries: readonly InstitutionRegistryEntry[],
): InstitutionRegistryEntry | undefined {
  return entries.find((entry) => entry.id === id);
}
