import { existsSync } from "node:fs";
import { join } from "node:path";

import type { InstitutionBrandAssetEntry } from "@/lib/institutions/brand-assets-registry-types";
import { INSTITUTION_REGISTRY } from "@/lib/institutions/registry";

export interface InstitutionBrandAssetValidationResult {
  valid: boolean;
  missingRegistryEntries: string[];
  orphanRegistryEntries: string[];
  duplicateAssetPaths: string[];
  brokenAssetPaths: string[];
  invalidEntries: string[];
}

export function validateInstitutionBrandAssetRegistry(
  entries: readonly InstitutionBrandAssetEntry[],
  publicDir = join(process.cwd(), "public"),
): InstitutionBrandAssetValidationResult {
  const institutionIds = new Set(INSTITUTION_REGISTRY.map((entry) => entry.id));
  const entryIds = new Set(entries.map((entry) => entry.institutionId));

  const missingRegistryEntries = INSTITUTION_REGISTRY.map((entry) => entry.id).filter(
    (id) => !entryIds.has(id),
  );

  const orphanRegistryEntries = entries
    .map((entry) => entry.institutionId)
    .filter((id) => !institutionIds.has(id));

  const pathToIds = new Map<string, string[]>();
  const brokenAssetPaths: string[] = [];
  const invalidEntries: string[] = [];

  for (const entry of entries) {
    if (entry.status === "available") {
      if (!entry.assetPath || entry.tier === "D") {
        invalidEntries.push(entry.institutionId);
        continue;
      }
      if (!entry.assetFormat) {
        invalidEntries.push(entry.institutionId);
      }
      const ids = pathToIds.get(entry.assetPath) ?? [];
      ids.push(entry.institutionId);
      pathToIds.set(entry.assetPath, ids);

      const diskPath = join(publicDir, entry.assetPath.replace(/^\//, ""));
      if (!existsSync(diskPath)) {
        brokenAssetPaths.push(entry.institutionId);
      }
    } else if (entry.assetPath !== null || entry.tier !== "D") {
      invalidEntries.push(entry.institutionId);
    }
  }

  const duplicateAssetPaths = [...pathToIds.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([path]) => path);

  return {
    valid:
      missingRegistryEntries.length === 0 &&
      orphanRegistryEntries.length === 0 &&
      duplicateAssetPaths.length === 0 &&
      brokenAssetPaths.length === 0 &&
      invalidEntries.length === 0,
    missingRegistryEntries,
    orphanRegistryEntries,
    duplicateAssetPaths,
    brokenAssetPaths,
    invalidEntries,
  };
}
