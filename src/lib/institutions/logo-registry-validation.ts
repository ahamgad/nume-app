import { existsSync } from "node:fs";
import { join } from "node:path";

import type { InstitutionLogoEntry } from "@/lib/institutions/logo-registry-types";
import { INSTITUTION_REGISTRY } from "@/lib/institutions/registry";

export interface InstitutionLogoValidationResult {
  valid: boolean;
  missingRegistryEntries: string[];
  orphanRegistryEntries: string[];
  duplicateLogoPaths: string[];
  brokenLogoPaths: string[];
  invalidAvailableEntries: string[];
}

export function validateInstitutionLogoRegistry(
  entries: readonly InstitutionLogoEntry[],
  publicDir = join(process.cwd(), "public"),
): InstitutionLogoValidationResult {
  const institutionIds = new Set(INSTITUTION_REGISTRY.map((entry) => entry.id));
  const entryIds = new Set(entries.map((entry) => entry.institutionId));

  const missingRegistryEntries = INSTITUTION_REGISTRY.map((entry) => entry.id).filter(
    (id) => !entryIds.has(id),
  );

  const orphanRegistryEntries = entries
    .map((entry) => entry.institutionId)
    .filter((id) => !institutionIds.has(id));

  const pathToIds = new Map<string, string[]>();
  const brokenLogoPaths: string[] = [];
  const invalidAvailableEntries: string[] = [];

  for (const entry of entries) {
    if (entry.status === "available") {
      if (!entry.logoPath) {
        invalidAvailableEntries.push(entry.institutionId);
        continue;
      }
      const ids = pathToIds.get(entry.logoPath) ?? [];
      ids.push(entry.institutionId);
      pathToIds.set(entry.logoPath, ids);

      const diskPath = join(publicDir, entry.logoPath.replace(/^\//, ""));
      if (!existsSync(diskPath)) {
        brokenLogoPaths.push(entry.institutionId);
      }
    } else if (entry.logoPath !== null) {
      invalidAvailableEntries.push(entry.institutionId);
    }
  }

  const duplicateLogoPaths = [...pathToIds.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([path]) => path);

  return {
    valid:
      missingRegistryEntries.length === 0 &&
      orphanRegistryEntries.length === 0 &&
      duplicateLogoPaths.length === 0 &&
      brokenLogoPaths.length === 0 &&
      invalidAvailableEntries.length === 0,
    missingRegistryEntries,
    orphanRegistryEntries,
    duplicateLogoPaths,
    brokenLogoPaths,
    invalidAvailableEntries,
  };
}
