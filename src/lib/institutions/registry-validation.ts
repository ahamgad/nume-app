import type { InstitutionRegistryEntry } from "@/lib/institutions/registry-types";

export interface InstitutionRegistryValidationResult {
  valid: boolean;
  duplicateIds: string[];
  duplicateShortNames: string[];
  duplicateFullNames: string[];
  conflictingMatchValues: Array<{ value: string; ids: string[] }>;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function collectDuplicates(
  entries: readonly InstitutionRegistryEntry[],
  pick: (entry: InstitutionRegistryEntry) => string,
): string[] {
  const valueToIds = new Map<string, string[]>();
  for (const entry of entries) {
    const key = normalize(pick(entry));
    const ids = valueToIds.get(key) ?? [];
    ids.push(entry.id);
    valueToIds.set(key, ids);
  }
  return [...valueToIds.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([value]) => value);
}

export function validateInstitutionRegistry(
  entries: readonly InstitutionRegistryEntry[],
): InstitutionRegistryValidationResult {
  const duplicateIds: string[] = [];
  const seenIds = new Set<string>();

  for (const entry of entries) {
    if (seenIds.has(entry.id)) duplicateIds.push(entry.id);
    seenIds.add(entry.id);
  }

  const duplicateShortNames = collectDuplicates(entries, (entry) => entry.shortName);
  const duplicateFullNames = collectDuplicates(entries, (entry) => entry.fullName);

  const matchValueToIds = new Map<string, string[]>();
  for (const entry of entries) {
    const aliases = [
      entry.shortName,
      entry.fullName,
      ...(entry.matchValues ?? []),
    ];
    for (const alias of aliases) {
      const key = normalize(alias);
      const ids = matchValueToIds.get(key) ?? [];
      if (!ids.includes(entry.id)) ids.push(entry.id);
      matchValueToIds.set(key, ids);
    }
  }
  const conflictingMatchValues = [...matchValueToIds.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([value, ids]) => ({ value, ids }));

  return {
    valid:
      duplicateIds.length === 0 &&
      duplicateShortNames.length === 0 &&
      duplicateFullNames.length === 0 &&
      conflictingMatchValues.length === 0,
    duplicateIds,
    duplicateShortNames,
    duplicateFullNames,
    conflictingMatchValues,
  };
}
