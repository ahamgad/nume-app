/**
 * Export NUME Content Matrix.xlsx for copy review and collaboration.
 *
 * This script is NOT part of application runtime. The app reads translations
 * only from src/lib/i18n/messages/en.ts and ar.ts.
 *
 * Workflow:
 *   en.ts + ar.ts → generate (this script) → NUME Content Matrix.xlsx
 *   → human review & copy editing → updated Excel
 *   → sync back into en.ts + ar.ts (separate sync step; app never reads .xlsx)
 *
 * Run: npm run content-matrix:generate
 */

import * as fs from "node:fs";
import * as path from "node:path";
import XLSX from "xlsx";

import { ar } from "../src/lib/i18n/messages/ar";
import { en } from "../src/lib/i18n/messages/en";

type Row = {
  Screen: string;
  Location: string;
  Component: string;
  "Translation Key": string;
  English: string;
  Arabic: string;
  Status: string;
  Notes: string;
};

const WORKSHEET_NAMES: Record<string, string> = {
  nav: "Navigation",
  a11y: "Accessibility",
  connectivity: "Connectivity",
  auth: "Authentication",
  common: "Common",
  picker: "Picker",
  fieldEditor: "Field Editor",
  dashboard: "Dashboard",
  planning: "Planning",
  goals: "Goals",
  accounts: "Accounts",
  institutions: "Institutions",
  businessDays: "Business Days",
  savings: "Savings",
  certificates: "Certificates",
  creditCards: "Credit Cards",
  records: "Records",
  more: "More & Settings",
};

const COMPONENT_HINTS: Record<string, string> = {
  title: "Screen / section title",
  lead: "Lead text",
  description: "Description",
  label: "Label",
  placeholder: "Placeholder",
  hint: "Helper text",
  submit: "Primary CTA",
  submitting: "Loading CTA",
  saving: "Loading CTA",
  creating: "Loading CTA",
  success: "Success message",
  error: "Error message",
  empty: "Empty state",
  action: "CTA button",
  confirm: "Confirm button",
  cancel: "Cancel button",
  searchPlaceholder: "Search placeholder",
  noResults: "Empty search state",
  validation: "Validation",
};

/** Hardcoded user-visible strings outside the i18n catalog. */
const EXTRA_COPY: Row[] = [
  {
    Screen: "Splash",
    Location: "splash-animation.tsx",
    Component: "Screen reader",
    "Translation Key": "(hardcoded)",
    English: "Loading NUME",
    Arabic: "",
    Status: "In app",
    Notes: "sr-only during intro hold",
  },
  {
    Screen: "Splash",
    Location: "splash-animation.tsx",
    Component: "Screen reader",
    "Translation Key": "(hardcoded)",
    English: "Welcome to NUME",
    Arabic: "",
    Status: "In app",
    Notes: "sr-only during curtain",
  },
  {
    Screen: "Splash",
    Location: "splash-animation.tsx",
    Component: "Wordmark",
    "Translation Key": "(hardcoded)",
    English: "NUME",
    Arabic: "NUME",
    Status: "In app",
    Notes: "Animated wordmark letters",
  },
  {
    Screen: "App",
    Location: "layout.tsx metadata",
    Component: "App title",
    "Translation Key": "(hardcoded)",
    English: "NUME",
    Arabic: "",
    Status: "In app",
    Notes: "Browser / PWA title",
  },
  {
    Screen: "App",
    Location: "layout.tsx metadata",
    Component: "Meta description",
    "Translation Key": "(hardcoded)",
    English: "Personal wealth operating system",
    Arabic: "",
    Status: "In app",
    Notes: "metadata.description",
  },
];

function flattenMessages(
  obj: Record<string, unknown>,
  prefix = "",
): Array<{ key: string; value: string }> {
  const entries: Array<{ key: string; value: string }> = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      entries.push({ key: fullKey, value });
    } else if (value && typeof value === "object") {
      entries.push(...flattenMessages(value as Record<string, unknown>, fullKey));
    }
  }

  return entries;
}

function inferComponent(key: string): string {
  const leaf = key.split(".").pop() ?? key;
  return COMPONENT_HINTS[leaf] ?? leaf;
}

function inferLocation(key: string): string {
  const parts = key.split(".");
  parts.pop();
  return parts.join(" › ") || "—";
}

function inferScreen(moduleKey: string, fullKey: string): string {
  const sheet = WORKSHEET_NAMES[moduleKey] ?? moduleKey;
  const sub = fullKey.split(".").slice(1, 3).join(" › ");
  return sub ? `${sheet} › ${sub}` : sheet;
}

function buildRows(): Map<string, Row[]> {
  const enFlat = flattenMessages(en as unknown as Record<string, unknown>);
  const arMap = new Map(
    flattenMessages(ar as unknown as Record<string, unknown>).map((e) => [
      e.key,
      e.value,
    ]),
  );

  const bySheet = new Map<string, Row[]>();

  for (const { key, value } of enFlat) {
    const moduleKey = key.split(".")[0] ?? "other";
    const sheetName = WORKSHEET_NAMES[moduleKey] ?? "Other";

    const row: Row = {
      Screen: inferScreen(moduleKey, key),
      Location: inferLocation(key),
      Component: inferComponent(key),
      "Translation Key": key,
      English: value,
      Arabic: arMap.get(key) ?? "",
      Status: "In app",
      Notes: "",
    };

    const rows = bySheet.get(sheetName) ?? [];
    rows.push(row);
    bySheet.set(sheetName, rows);
  }

  const splashRows = bySheet.get("Splash") ?? [];
  bySheet.set("Splash", [...splashRows, ...EXTRA_COPY.filter((r) => r.Screen === "Splash")]);

  const appRows = EXTRA_COPY.filter((r) => r.Screen === "App");
  if (appRows.length > 0) {
    bySheet.set("App Shell", appRows);
  }

  return bySheet;
}

function main() {
  const bySheet = buildRows();
  const workbook = XLSX.utils.book_new();

  const readme: Row[] = [
    {
      Screen: "—",
      Location: "—",
      Component: "—",
      "Translation Key": "—",
      English: "NUME Content Matrix",
      Arabic: "—",
      Status: "—",
      Notes: `Generated ${new Date().toISOString().slice(0, 10)} from src/lib/i18n/messages/*.ts`,
    },
    {
      Screen: "—",
      Location: "—",
      Component: "—",
      "Translation Key": "—",
      English: "Edit copy in this workbook, then sync back to the app.",
      Arabic: "—",
      Status: "—",
      Notes: "Do not rename Translation Key column values when syncing.",
    },
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(readme),
    "README",
  );

  const sheetOrder = [
    "Navigation",
    "Accessibility",
    "Connectivity",
    "Authentication",
    "Common",
    "Dashboard",
    "Planning",
    "Goals",
    "Accounts",
    "Savings",
    "Certificates",
    "Credit Cards",
    "Records",
    "Institutions",
    "Business Days",
    "More & Settings",
    "Picker",
    "Field Editor",
    "Splash",
    "App Shell",
  ];

  for (const name of sheetOrder) {
    const rows = bySheet.get(name);
    if (!rows?.length) continue;
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(rows),
      name.slice(0, 31),
    );
  }

  for (const [name, rows] of bySheet) {
    if (sheetOrder.includes(name) || name === "README") continue;
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(rows),
      name.slice(0, 31),
    );
  }

  const outputPath = path.join(process.cwd(), "NUME Content Matrix.xlsx");
  XLSX.writeFile(workbook, outputPath);

  let total = 0;
  for (const rows of bySheet.values()) total += rows.length;
  console.log(`Wrote ${outputPath} (${total} strings across ${bySheet.size} worksheets)`);
}

main();
