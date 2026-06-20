#!/usr/bin/env node
/**
 * Collects institution brand assets (app icons, brand marks, compact logos),
 * normalizes to square assets, writes public/institutions/{id}.{png|svg},
 * and refreshes brand-assets-registry-data.json.
 *
 * Run: npm run brand-assets:collect
 */

import { mkdir, unlink, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import sharp from "sharp";

import {
  TIER_A_APP_ICONS,
  TIER_C_SVG,
  TIER_D_FALLBACK,
} from "./brand-assets-manifest.mjs";
import {
  STABLE_SOURCE_OVERRIDES,
  VALIDATION_FALLBACK_IDS,
} from "./brand-assets-stable-sources.mjs";

const execFileAsync = promisify(execFile);

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "public", "institutions");
const DATA_PATH = join(
  ROOT,
  "src/lib/institutions/brand-assets-registry-data.json",
);
const DELAY_MS = 400;
const TODAY = new Date().toISOString().slice(0, 10);
const PNG_SIZE = 256;

const FALLBACK_IDS = new Set([...TIER_D_FALLBACK, ...VALIDATION_FALLBACK_IDS]);
const OVERRIDE_IDS = new Set(Object.keys(STABLE_SOURCE_OVERRIDES));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isSvgDocument(text) {
  const trimmed = text.trim();
  return (
    (/^<\?xml|^<svg/i.test(trimmed) && trimmed.includes("</svg>")) ||
    trimmed.includes("<svg")
  );
}

function parseViewBox(svg) {
  const match = svg.match(/viewBox=["']([^"']+)["']/i);
  if (!match) return null;
  const parts = match[1].trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return null;
  return { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] };
}

function parseDimensions(svg) {
  const widthMatch = svg.match(/\bwidth=["']([\d.]+)/i);
  const heightMatch = svg.match(/\bheight=["']([\d.]+)/i);
  if (widthMatch && heightMatch) {
    return { width: Number(widthMatch[1]), height: Number(heightMatch[1]) };
  }
  return null;
}

function normalizeSvg(rawSvg, cropViewBox) {
  let svg = rawSvg.trim();
  if (!isSvgDocument(svg)) throw new Error("Not an SVG document");

  svg = svg.replace(/<\?xml[^?]*\?>/gi, "").replace(/<!DOCTYPE[^>]*>/gi, "");

  let box = parseViewBox(svg);
  if (!box) {
    const dims = parseDimensions(svg);
    if (dims) box = { minX: 0, minY: 0, width: dims.width, height: dims.height };
  }
  if (!box) box = { minX: 0, minY: 0, width: 100, height: 100 };

  if (cropViewBox) {
    const [minX, minY, width, height] = cropViewBox;
    box = { minX, minY, width, height };
  }

  const padRatio = 0.1;
  const maxDim = Math.max(box.width, box.height);
  const padded = maxDim * (1 + padRatio * 2);
  const cx = box.minX + box.width / 2;
  const cy = box.minY + box.height / 2;
  const newMinX = cx - padded / 2;
  const newMinY = cy - padded / 2;

  const inner = svg
    .replace(/^[\s\S]*?<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-hidden="true">`,
    `  <g transform="translate(${((newMinX / padded) * -100).toFixed(4)} ${((newMinY / padded) * -100).toFixed(4)}) scale(${(100 / padded).toFixed(6)})">`,
    `    <svg x="${box.minX}" y="${box.minY}" width="${box.width}" height="${box.height}" viewBox="${box.minX} ${box.minY} ${box.width} ${box.height}">`,
    inner,
    `    </svg>`,
    `  </g>`,
    `</svg>`,
    "",
  ].join("\n");
}

async function downloadSvgViaCurl(url) {
  const { stdout } = await execFileAsync(
    "curl",
    ["-sL", "-A", "NUME-BrandAssets/1.0", url],
    { maxBuffer: 10 * 1024 * 1024 },
  );
  return stdout;
}

async function downloadBinaryViaCurl(url) {
  const tmp = join(tmpdir(), `nume-brand-asset-${Date.now()}.bin`);
  try {
    await execFileAsync("curl", [
      "-sL",
      "-A",
      "NUME-BrandAssets/1.0",
      "-o",
      tmp,
      url,
    ]);
    return await readFile(tmp);
  } finally {
    try {
      await unlink(tmp);
    } catch {
      // temp file already removed
    }
  }
}

async function downloadBinary(url) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "NUME-BrandAssets/1.0",
        Accept: "image/png,image/jpeg,image/webp,image/*,*/*",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 500) throw new Error("Response too small for image");
    return buffer;
  } catch (fetchError) {
    try {
      const buffer = await downloadBinaryViaCurl(url);
      if (buffer.length < 500) throw new Error("Response too small for image");
      return buffer;
    } catch {
      throw fetchError;
    }
  }
}

async function downloadSvg(url) {
  let text;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "NUME-BrandAssets/1.0",
        Accept: "image/svg+xml,text/xml,application/xml,*/*",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    text = await res.text();
  } catch (fetchError) {
    try {
      text = await downloadSvgViaCurl(url);
    } catch {
      throw fetchError;
    }
  }
  if (!isSvgDocument(text)) throw new Error("Response is not SVG");
  return text;
}

async function removeAssetVariants(id) {
  for (const ext of ["png", "svg"]) {
    try {
      await unlink(join(OUT_DIR, `${id}.${ext}`));
    } catch {
      // no prior asset
    }
  }
}

async function writePngAsset(id, buffer, pngCrop) {
  const outPath = join(OUT_DIR, `${id}.png`);
  let pipeline = sharp(buffer);

  if (pngCrop) {
    const meta = await sharp(buffer).metadata();
    const width = meta.width ?? PNG_SIZE;
    const height = meta.height ?? PNG_SIZE;
    pipeline = sharp(buffer).extract({
      left: Math.round(pngCrop.left * width),
      top: Math.round(pngCrop.top * height),
      width: Math.max(1, Math.round(pngCrop.width * width)),
      height: Math.max(1, Math.round(pngCrop.height * height)),
    });
  }

  await pipeline
    .resize(PNG_SIZE, PNG_SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outPath);
  return `/institutions/${id}.png`;
}

async function writeSvgAsset(id, rawSvg, cropViewBox) {
  const outPath = join(OUT_DIR, `${id}.svg`);
  const normalized = normalizeSvg(rawSvg, cropViewBox);
  await writeFile(outPath, normalized, "utf8");
  return `/institutions/${id}.svg`;
}

/** @type {Record<string, import('./brand-assets-manifest.mjs').TierAEntry | import('./brand-assets-manifest.mjs').TierCEntry | import('./brand-assets-stable-sources.mjs').StableSourceEntry | null>} */
const MANIFEST = {
  ...Object.fromEntries(
    Object.entries(TIER_A_APP_ICONS)
      .filter(([id]) => !OVERRIDE_IDS.has(id) && !FALLBACK_IDS.has(id))
      .map(([id, spec]) => [id, { tier: "A", format: "png", ...spec }]),
  ),
  ...Object.fromEntries(
    Object.entries(STABLE_SOURCE_OVERRIDES).map(([id, spec]) => [id, spec]),
  ),
  ...Object.fromEntries(
    Object.entries(TIER_C_SVG).map(([id, spec]) => [
      id,
      { tier: "C", format: "svg", ...spec },
    ]),
  ),
  ...Object.fromEntries(
    [...FALLBACK_IDS].map((id) => [id, null]),
  ),
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const allIds = new Set([
    ...Object.keys(TIER_A_APP_ICONS),
    ...Object.keys(TIER_C_SVG),
    ...Object.keys(STABLE_SOURCE_OVERRIDES),
    ...FALLBACK_IDS,
  ]);

  /** @type {Array<Record<string, unknown>>} */
  const registry = [];

  for (const id of [...allIds].sort()) {
    const spec = MANIFEST[id] ?? null;

    if (!spec) {
      await removeAssetVariants(id);
      registry.push({
        institutionId: id,
        status: "fallback",
        tier: "D",
        assetPath: null,
      });
      continue;
    }

    try {
      await removeAssetVariants(id);
      let assetPath;
      if (spec.format === "png") {
        const buffer = await downloadBinary(spec.url);
        assetPath = await writePngAsset(id, buffer, spec.pngCrop);
      } else {
        const raw = await downloadSvg(spec.url);
        assetPath = await writeSvgAsset(id, raw, spec.cropViewBox);
      }

      registry.push({
        institutionId: id,
        status: "available",
        tier: spec.tier,
        assetPath,
        assetFormat: spec.format,
        isOfficial: true,
        lastUpdated: TODAY,
        source: spec.source,
      });
      console.log(`✓ ${id} (Tier ${spec.tier})`);
    } catch (error) {
      console.warn(`✗ ${id}: ${error.message}`);
      await removeAssetVariants(id);
      registry.push({
        institutionId: id,
        status: "fallback",
        tier: "D",
        assetPath: null,
      });
    }

    await sleep(DELAY_MS);
  }

  registry.sort((a, b) =>
    String(a.institutionId).localeCompare(String(b.institutionId)),
  );

  await writeFile(
    DATA_PATH,
    JSON.stringify({ generatedAt: TODAY, entries: registry }, null, 2),
    "utf8",
  );

  const counts = { A: 0, B: 0, C: 0, D: 0 };
  for (const entry of registry) {
    if (entry.status === "available") counts[entry.tier]++;
    else counts.D++;
  }
  console.log(
    `\nCollected ${registry.filter((e) => e.status === "available").length}/${registry.length} assets`,
  );
  console.log(`Tier A=${counts.A} B=${counts.B} C=${counts.C} D=${counts.D}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
