#!/usr/bin/env node
/**
 * Generates production auth email HTML from the Design System email rendering target.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  confirmEmailContent,
  recoveryEmailContent,
} from "../src/lib/email/design-tokens.ts";
import { renderAuthEmailHtml } from "../src/lib/email/render-auth-email.ts";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(ROOT, "..", "emails", "auth");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const confirmHtml = renderAuthEmailHtml(confirmEmailContent);
  const recoveryHtml = renderAuthEmailHtml(recoveryEmailContent);

  await writeFile(path.join(OUT_DIR, "confirm-email.html"), confirmHtml);
  await writeFile(path.join(OUT_DIR, "reset-password.html"), recoveryHtml);

  console.log("✓ emails/auth/confirm-email.html");
  console.log("✓ emails/auth/reset-password.html");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
