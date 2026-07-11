#!/usr/bin/env node
/**
 * Generates the hosted email brand mark PNG from the Design System SVG.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import { emailDesignTokens } from "../src/lib/email/design-tokens.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const EMAIL_ASSET_DIR = path.join(ROOT, "public", "email");
const SVG_SOURCE = path.join(ROOT, "public", "brand-flatten-background.svg");

async function main() {
  await mkdir(EMAIL_ASSET_DIR, { recursive: true });

  await sharp(SVG_SOURCE, { density: 288 })
    .resize(emailDesignTokens.logoAssetPx, emailDesignTokens.logoAssetPx)
    .png()
    .toFile(path.join(EMAIL_ASSET_DIR, "nume-mark.png"));
  console.log("✓ public/email/nume-mark.png");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
