#!/usr/bin/env node
/**
 * Generates hosted email brand marks and foundation email previews.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import {
  emailFoundationTokens,
  renderOtpEmailHtml,
  renderOtpEmailPreviewHtml,
} from "../src/lib/email/foundation/index.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const EMAIL_ASSET_DIR = path.join(ROOT, "public", "email");
const OTP_EMAIL_DIR = path.join(ROOT, "emails", "otp");

async function writeLogoAsset(sourceSvg, filename) {
  await sharp(path.join(ROOT, sourceSvg), { density: 288 })
    .resize(emailFoundationTokens.logoAssetPx, emailFoundationTokens.logoAssetPx)
    .png()
    .toFile(path.join(EMAIL_ASSET_DIR, filename));
}

async function main() {
  await mkdir(EMAIL_ASSET_DIR, { recursive: true });
  await mkdir(OTP_EMAIL_DIR, { recursive: true });

  await writeLogoAsset(
    "public/brand-flatten-background.svg",
    "nume-mark-light.png",
  );
  await writeLogoAsset(
    "public/brand-flatten-background.svg",
    "nume-mark-dark.png",
  );
  await writeLogoAsset(
    "public/brand-flatten-background.svg",
    "nume-mark.png",
  );
  console.log("✓ public/email/nume-mark-light.png");
  console.log("✓ public/email/nume-mark-dark.png");
  console.log("✓ public/email/nume-mark.png");

  await writeFile(
    path.join(OTP_EMAIL_DIR, "template.html"),
    renderOtpEmailHtml(),
    "utf8",
  );
  console.log("✓ emails/otp/template.html");

  await writeFile(
    path.join(OTP_EMAIL_DIR, "preview.html"),
    renderOtpEmailPreviewHtml(),
    "utf8",
  );
  console.log("✓ emails/otp/preview.html");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
