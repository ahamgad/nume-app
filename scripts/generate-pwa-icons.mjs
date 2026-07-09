#!/usr/bin/env node
/**
 * Generates crisp PWA icon PNGs and a multi-resolution favicon.ico
 * from the approved SVG source.
 * Source of truth: public/brand-flatten-background.svg
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SVG_SOURCE = path.join(ROOT, "public/brand-flatten-background.svg");
const OUT_DIR = path.join(ROOT, "public/icons");
const APP_FAVICON = path.join(ROOT, "src/app/favicon.ico");
const PUBLIC_FAVICON = path.join(ROOT, "public/favicon.ico");

/** Render SVG at 3× target size, then downscale for sharper edges. */
async function renderPng(size) {
  const svg = await readFile(SVG_SOURCE);
  const renderSize = size * 3;

  return sharp(svg, { density: 288 })
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
}

/**
 * Build a real .ico containing PNG payloads (Vista+ / all modern browsers).
 * @param {{ size: number, png: Buffer }[]} images
 */
function encodeIco(images) {
  const count = images.length;
  const headerSize = 6;
  const directorySize = 16 * count;
  let offset = headerSize + directorySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const directories = [];
  const payloads = [];

  for (const { size, png } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    directories.push(entry);
    payloads.push(png);
    offset += png.length;
  }

  return Buffer.concat([header, ...directories, ...payloads]);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const pngExports = [
    [1024, "icon-1024.png"],
    [512, "icon-512.png"],
    [192, "icon-192.png"],
    [180, "apple-touch-icon.png"],
    [32, "favicon-32.png"],
    [16, "favicon-16.png"],
  ];

  for (const [size, name] of pngExports) {
    const png = await renderPng(size);
    await writeFile(path.join(OUT_DIR, name), png);
    const meta = await sharp(png).metadata();
    console.log(`✓ ${name} (${meta.width}×${meta.height})`);
  }

  const icoSizes = [16, 32, 48];
  const icoImages = [];
  for (const size of icoSizes) {
    icoImages.push({ size, png: await renderPng(size) });
  }
  const ico = encodeIco(icoImages);

  await writeFile(APP_FAVICON, ico);
  await writeFile(PUBLIC_FAVICON, ico);
  console.log(
    `✓ favicon.ico (${icoSizes.join("/")} → src/app + public, ${ico.length} bytes)`,
  );

  await writeFile(
    path.join(OUT_DIR, "README.md"),
    `# PWA Icons

Generated from \`public/brand-flatten-background.svg\`.

Regenerate: \`npm run icons:generate\`

Master: \`icon-1024.png\`

Favicon: multi-resolution \`.ico\` (16/32/48) written to \`src/app/favicon.ico\`
(and mirrored to \`public/favicon.ico\`).
`,
  );

  console.log("\nAll PWA icons generated successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
