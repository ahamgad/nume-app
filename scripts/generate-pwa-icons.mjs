#!/usr/bin/env node
/**
 * Generates crisp PWA icon PNGs from the approved SVG source.
 * Source of truth: public/brand-flatten-background.svg
 */
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SVG_SOURCE = path.join(ROOT, "public/brand-flatten-background.svg");
const OUT_DIR = path.join(ROOT, "public/icons");

/** Render SVG at 3× target size, then downscale for sharper edges. */
async function renderIcon(size, outputName) {
  const svg = await readFile(SVG_SOURCE);
  const renderSize = size * 3;

  const png = await sharp(svg, { density: 288 })
    .resize(renderSize, renderSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .png({
      compressionLevel: 6,
      palette: false,
      quality: 100,
      effort: 10,
    })
    .toBuffer();

  await writeFile(path.join(OUT_DIR, outputName), png);
  const meta = await sharp(png).metadata();
  console.log(`✓ ${outputName} (${meta.width}×${meta.height})`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const exports = [
    [1024, "icon-1024.png"],
    [512, "icon-512.png"],
    [192, "icon-192.png"],
    [180, "apple-touch-icon.png"],
    [32, "favicon-32.png"],
    [16, "favicon-16.png"],
  ];

  for (const [size, name] of exports) {
    await renderIcon(size, name);
  }

  await copyFile(
    path.join(OUT_DIR, "favicon-32.png"),
    path.join(ROOT, "public/favicon.ico"),
  );
  console.log("✓ favicon.ico (from favicon-32.png)");

  await writeFile(
    path.join(OUT_DIR, "README.md"),
    `# PWA Icons

Generated from \`public/brand-flatten-background.svg\`.

Regenerate: \`npm run icons:generate\`

Master: \`icon-1024.png\`
`,
  );

  console.log("\nAll PWA icons generated successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
