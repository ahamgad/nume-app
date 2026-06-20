#!/usr/bin/env node
/**
 * Generates src/lib/institutions/brand-assets-registry.ts from brand-assets-registry-data.json
 *
 * Run: node scripts/generate-brand-assets-registry.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DATA_PATH = join(
  ROOT,
  "src/lib/institutions/brand-assets-registry-data.json",
);
const OUT_PATH = join(ROOT, "src/lib/institutions/brand-assets-registry.ts");

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));

const lines = data.entries.map((entry) => {
  if (entry.status === "available") {
    return `  {
    institutionId: "${entry.institutionId}",
    status: "available",
    tier: "${entry.tier}",
    assetPath: "${entry.assetPath}",
    assetFormat: "${entry.assetFormat}",
    isOfficial: true,
    lastUpdated: "${entry.lastUpdated}",
    source: ${entry.source ? `"${entry.source}"` : "undefined"},
  },`;
  }
  return `  {
    institutionId: "${entry.institutionId}",
    status: "fallback",
    tier: "D",
    assetPath: null,
  },`;
});

const content = `import type { InstitutionBrandAssetEntry } from "@/lib/institutions/brand-assets-registry-types";

/** Brand asset registry for all institutions in {@link INSTITUTION_REGISTRY}. */
export const INSTITUTION_BRAND_ASSET_REGISTRY: readonly InstitutionBrandAssetEntry[] = [
${lines.join("\n")}
] as const;

export function getInstitutionBrandAssetEntry(
  institutionId: string,
): InstitutionBrandAssetEntry | undefined {
  return INSTITUTION_BRAND_ASSET_REGISTRY.find(
    (entry) => entry.institutionId === institutionId,
  );
}

export function getInstitutionBrandAssetPath(
  institutionId: string,
): string | null {
  const entry = getInstitutionBrandAssetEntry(institutionId);
  return entry?.status === "available" ? entry.assetPath : null;
}
`;

writeFileSync(OUT_PATH, content);
console.log(`Wrote ${OUT_PATH} (${data.entries.length} entries)`);
