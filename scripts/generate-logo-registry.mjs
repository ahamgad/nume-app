#!/usr/bin/env node
/**
 * Generates src/lib/institutions/logo-registry.ts from logo-registry-data.json
 *
 * Run: node scripts/generate-logo-registry.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DATA_PATH = join(ROOT, "src/lib/institutions/logo-registry-data.json");
const OUT_PATH = join(ROOT, "src/lib/institutions/logo-registry.ts");

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));

const lines = data.entries.map((entry) => {
  if (entry.status === "available") {
    return `  {
    institutionId: "${entry.institutionId}",
    status: "available",
    logoPath: "${entry.logoPath}",
    isOfficial: true,
    lastUpdated: "${entry.lastUpdated}",
  },`;
  }
  return `  {
    institutionId: "${entry.institutionId}",
    status: "fallback",
    logoPath: null,
  },`;
});

const content = `import type { InstitutionLogoEntry } from "@/lib/institutions/logo-registry-types";

/** Logo registry for all institutions in {@link INSTITUTION_REGISTRY}. */
export const INSTITUTION_LOGO_REGISTRY: readonly InstitutionLogoEntry[] = [
${lines.join("\n")}
] as const;

export function getInstitutionLogoEntry(
  institutionId: string,
): InstitutionLogoEntry | undefined {
  return INSTITUTION_LOGO_REGISTRY.find((entry) => entry.institutionId === institutionId);
}

export function getInstitutionLogoPath(institutionId: string): string | null {
  const entry = getInstitutionLogoEntry(institutionId);
  return entry?.status === "available" ? entry.logoPath : null;
}
`;

writeFileSync(OUT_PATH, content);
console.log(`Wrote ${OUT_PATH} (${data.entries.length} entries)`);
