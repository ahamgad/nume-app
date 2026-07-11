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
const GEIST_BOLD = path.join(
  ROOT,
  "node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf",
);
const ICON_DISPLAY_PX = 20;
const WORDMARK_DISPLAY_HEIGHT_PX = 15;
const RETINA_SCALE = 3;

function buildWordmarkSvg({ fill, fontSize = 56, letterSpacing = 5.6 }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80" viewBox="0 0 240 80">
  <defs>
    <style>
      @font-face {
        font-family: 'Geist';
        src: url('file://${GEIST_BOLD}') format('truetype');
      }
    </style>
  </defs>
  <text x="0" y="56" font-family="Geist, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="${letterSpacing}" fill="${fill}">NUME</text>
</svg>`;
}

async function writeIconAsset(sourceSvg, filename) {
  await sharp(path.join(ROOT, sourceSvg), { density: 288 })
    .resize(ICON_DISPLAY_PX * RETINA_SCALE, ICON_DISPLAY_PX * RETINA_SCALE, {
      fit: "inside",
    })
    .png()
    .toFile(path.join(EMAIL_ASSET_DIR, filename));
}

async function writeWordmarkAsset(filename, fill) {
  const svg = buildWordmarkSvg({ fill });
  const trimmed = sharp(Buffer.from(svg)).trim();
  const metadata = await trimmed.metadata();
  const displayWidth = Math.round(
    (metadata.width / metadata.height) * WORDMARK_DISPLAY_HEIGHT_PX,
  );

  const brandWordmarkSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${metadata.width}" height="${metadata.height}" viewBox="0 0 ${metadata.width} ${metadata.height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="56" fill="${fill}" font-family="Geist Sans, Geist, -apple-system, BlinkMacSystemFont, sans-serif" font-size="56" font-weight="700" letter-spacing="0.1em">NUME</text>
</svg>`;

  await writeFile(
    path.join(ROOT, "public", "brand-wordmark-black.svg"),
    brandWordmarkSvg,
    "utf8",
  );

  await trimmed
    .resize(
      displayWidth * RETINA_SCALE,
      WORDMARK_DISPLAY_HEIGHT_PX * RETINA_SCALE,
      { fit: "inside" },
    )
    .png()
    .toFile(path.join(EMAIL_ASSET_DIR, filename));

  return { displayWidth, displayHeight: WORDMARK_DISPLAY_HEIGHT_PX };
}

async function main() {
  await mkdir(EMAIL_ASSET_DIR, { recursive: true });
  await mkdir(OTP_EMAIL_DIR, { recursive: true });

  await writeIconAsset("public/brand-flatten-black.svg", "nume-icon.png");
  console.log("✓ public/email/nume-icon.png");

  const wordmark = await writeWordmarkAsset("nume-wordmark.png", "#171717");
  console.log("✓ public/brand-wordmark-black.svg");
  console.log(
    `✓ public/email/nume-wordmark.png (${wordmark.displayWidth}x${wordmark.displayHeight})`,
  );

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
