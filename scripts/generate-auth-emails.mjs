#!/usr/bin/env node
/**
 * Generates OTP email assets and HTML previews.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import {
  renderOtpEmailPreviewHtml,
  renderOtpEmailTemplateHtml,
} from "../src/lib/email/otp-email-template.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const EMAIL_ASSET_DIR = path.join(ROOT, "public", "email");
const OTP_EMAIL_DIR = path.join(ROOT, "emails", "otp");
const ICON_ASSET_PX = 60;

async function writeIconAsset(sourceSvg, filename) {
  await sharp(path.join(ROOT, sourceSvg), { density: 288 })
    .resize(ICON_ASSET_PX, ICON_ASSET_PX)
    .png()
    .toFile(path.join(EMAIL_ASSET_DIR, filename));
}

async function main() {
  await mkdir(EMAIL_ASSET_DIR, { recursive: true });
  await mkdir(OTP_EMAIL_DIR, { recursive: true });

  await writeIconAsset("public/brand-flatten-black.svg", "nume-icon-light.png");
  await writeIconAsset("public/brand-flatten-white.svg", "nume-icon-dark.png");
  console.log("✓ public/email/nume-icon-light.png");
  console.log("✓ public/email/nume-icon-dark.png");

  await writeFile(
    path.join(OTP_EMAIL_DIR, "template.html"),
    renderOtpEmailTemplateHtml(),
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
