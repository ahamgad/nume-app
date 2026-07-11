#!/usr/bin/env node
/**
 * Generates OTP email assets and HTML previews.
 */
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import { NUME_EMAIL_COLORS } from "../src/lib/email/email-design-tokens.ts";
import {
  OTP_EMAIL_ICON_DISPLAY_PX,
  OTP_EMAIL_WORDMARK_DISPLAY_HEIGHT_PX,
  renderOtpEmailPreviewHtml,
  renderOtpEmailTemplateHtml,
} from "../src/lib/email/otp-email-template.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const EMAIL_ASSET_DIR = path.join(ROOT, "public", "email");
const OTP_EMAIL_DIR = path.join(ROOT, "emails", "otp");
const FONT_SANS_DIR = path.join(ROOT, "public", "fonts", "geist-sans");
const FONT_MONO_DIR = path.join(ROOT, "public", "fonts", "geist-mono");
const GEIST_SANS = path.join(
  ROOT,
  "node_modules/geist/dist/fonts/geist-sans",
);
const GEIST_MONO = path.join(
  ROOT,
  "node_modules/geist/dist/fonts/geist-mono",
);
const RETINA_SCALE = 3;

const SANS_FONT_FILES = [
  "Geist-Regular.woff2",
  "Geist-SemiBold.woff2",
  "Geist-Bold.woff2",
];

const MONO_FONT_FILES = ["GeistMono-SemiBold.woff2"];

function buildWordmarkSvg({ fill, fontSize = 56, letterSpacing = 5.6 }) {
  const geistBold = path.join(GEIST_SANS, "Geist-Bold.ttf");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80" viewBox="0 0 240 80">
  <defs>
    <style>
      @font-face {
        font-family: 'Geist';
        src: url('file://${geistBold}') format('truetype');
      }
    </style>
  </defs>
  <text x="0" y="56" font-family="Geist, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="${letterSpacing}" fill="${fill}">NUME</text>
</svg>`;
}

async function writeIconAsset(sourceSvg, filename) {
  await sharp(path.join(ROOT, sourceSvg), { density: 288 })
    .resize(OTP_EMAIL_ICON_DISPLAY_PX * RETINA_SCALE, OTP_EMAIL_ICON_DISPLAY_PX * RETINA_SCALE, {
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
    (metadata.width / metadata.height) * OTP_EMAIL_WORDMARK_DISPLAY_HEIGHT_PX,
  );

  await trimmed
    .resize(
      displayWidth * RETINA_SCALE,
      OTP_EMAIL_WORDMARK_DISPLAY_HEIGHT_PX * RETINA_SCALE,
      { fit: "inside" },
    )
    .png()
    .toFile(path.join(EMAIL_ASSET_DIR, filename));

  return { displayWidth, displayHeight: OTP_EMAIL_WORDMARK_DISPLAY_HEIGHT_PX };
}

async function writeBrandWordmarkSvg(fill) {
  const svg = buildWordmarkSvg({ fill });
  const trimmed = await sharp(Buffer.from(svg)).trim().toBuffer();
  const metadata = await sharp(trimmed).metadata();
  const filename =
    fill.toUpperCase() === NUME_EMAIL_COLORS.dark.foreground
      ? "brand-wordmark-white.svg"
      : "brand-wordmark-black.svg";

  const brandWordmarkSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${metadata.width}" height="${metadata.height}" viewBox="0 0 ${metadata.width} ${metadata.height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="56" fill="${fill}" font-family="Geist Sans, Geist, -apple-system, BlinkMacSystemFont, sans-serif" font-size="56" font-weight="700" letter-spacing="0.1em">NUME</text>
</svg>`;

  await writeFile(path.join(ROOT, "public", filename), brandWordmarkSvg, "utf8");
}

async function copyEmailFonts() {
  await mkdir(FONT_SANS_DIR, { recursive: true });
  await mkdir(FONT_MONO_DIR, { recursive: true });

  for (const file of SANS_FONT_FILES) {
    await copyFile(path.join(GEIST_SANS, file), path.join(FONT_SANS_DIR, file));
    console.log(`✓ public/fonts/geist-sans/${file}`);
  }

  for (const file of MONO_FONT_FILES) {
    await copyFile(path.join(GEIST_MONO, file), path.join(FONT_MONO_DIR, file));
    console.log(`✓ public/fonts/geist-mono/${file}`);
  }
}

async function main() {
  await mkdir(EMAIL_ASSET_DIR, { recursive: true });
  await mkdir(OTP_EMAIL_DIR, { recursive: true });

  await copyEmailFonts();

  await writeIconAsset("public/brand-flatten-black.svg", "nume-icon.png");
  await writeIconAsset("public/brand-flatten-white.svg", "nume-icon-dark.png");
  console.log("✓ public/email/nume-icon.png");
  console.log("✓ public/email/nume-icon-dark.png");

  const wordmarkLight = await writeWordmarkAsset(
    "nume-wordmark.png",
    NUME_EMAIL_COLORS.light.foreground,
  );
  const wordmarkDark = await writeWordmarkAsset(
    "nume-wordmark-dark.png",
    NUME_EMAIL_COLORS.dark.foreground,
  );
  await writeBrandWordmarkSvg(NUME_EMAIL_COLORS.light.foreground);
  await writeBrandWordmarkSvg(NUME_EMAIL_COLORS.dark.foreground);
  console.log("✓ public/brand-wordmark-black.svg");
  console.log("✓ public/brand-wordmark-white.svg");
  console.log(
    `✓ public/email/nume-wordmark.png (${wordmarkLight.displayWidth}x${wordmarkLight.displayHeight})`,
  );
  console.log(
    `✓ public/email/nume-wordmark-dark.png (${wordmarkDark.displayWidth}x${wordmarkDark.displayHeight})`,
  );

  if (wordmarkLight.displayWidth !== wordmarkDark.displayWidth) {
    console.warn(
      `Wordmark widths differ: light=${wordmarkLight.displayWidth}, dark=${wordmarkDark.displayWidth}`,
    );
  }

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
