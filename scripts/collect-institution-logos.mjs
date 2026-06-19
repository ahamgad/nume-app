#!/usr/bin/env node
/**
 * Downloads official institution logos, normalizes SVGs to a square canvas,
 * and writes public/institutions/{id}.svg.
 *
 * Run: node scripts/collect-institution-logos.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "public", "institutions");
const REGISTRY_PATH = join(ROOT, "src", "lib", "institutions", "logo-registry-data.json");
const DELAY_MS = 2000;
const TODAY = new Date().toISOString().slice(0, 10);

/** @typedef {{ url: string; source: string; official?: boolean } | null} LogoSource */

/** @type {Record<string, LogoSource>} */
const MANIFEST = {
  cib: {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Cib_Logo.svg",
    source: "https://www.cibeg.com/",
    official: true,
  },
  nbe: {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/32/National_Bank_of_Egypt.svg",
    source: "https://www.nbe.com.eg/",
    official: true,
  },
  banque_misr: {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/49/Banque_Misr.svg",
    source: "https://www.banquemisr.com/",
    official: true,
  },
  banque_du_caire: {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/74/Banque_du_caire_Logo.svg",
    source: "https://www.bdc.com.eg/",
    official: true,
  },
  qnb_alahli: {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/79/Qatar_National_Bank_Logo_%28till_2012%29.svg",
    source: "https://www.qnbalahli.com/",
    official: true,
  },
  hsbc: {
    url: "https://upload.wikimedia.org/wikipedia/commons/a/aa/HSBC_logo_%282018%29.svg",
    source: "https://www.hsbc.com.eg/",
    official: true,
  },
  alexbank: {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Alex_Bank_Logo.svg",
    source: "https://www.alexbank.com/",
    official: true,
  },
  credit_agricole: {
    url: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Cr%C3%A9dit_Agricole_2020_logo.svg",
    source: "https://www.credit-agricole.com.eg/",
    official: true,
  },
  aaib: null,
  fab: {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/22/First_Abu_Dhabi_Bank_Logo.svg",
    source: "https://www.bankfab.com/",
    official: true,
  },
  adcb: {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/25/Abu_Dhabi_Commercial_Bank_logo.svg",
    source: "https://www.adcb.com.eg/",
    official: true,
  },
  arab_bank: {
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Arab_Bank.svg",
    source: "https://www.arabbank.com.eg/",
    official: true,
  },
  nbk: {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/36/NBK_logo.svg",
    source: "https://www.nbk.com/",
    official: true,
  },
  saib: null,
  egbank: null,
  adib: null,
  faisal_islamic: null,
  al_baraka: {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/91/Al_Baraka_Bank_Logo.svg",
    source: "https://www.albaraka.com.eg/",
    official: true,
  },
  mid_bank: null,
  emirates_nbd: null,
  hdb: null,
  edbe: null,
  united_bank: null,
  attijariwafa: null,
  suez_canal: {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Suez_Canal_Bank_Logo.svg",
    source: "https://www.scbank.com.eg/",
    official: true,
  },
  kfh: null,
  abk: null,
  mashreq: null,
  bank_abc: null,
  aib: null,
  abe: null,
  bank_nxt: null,
  vodafone_cash: {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Vodafone_logo_2017.svg",
    source: "https://web.vodafone.com.eg/",
    official: true,
  },
  orange_cash: {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg",
    source: "https://www.orange.eg/",
    official: true,
  },
  etisalat_cash: {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Etisalat_eand_Logo_EN.svg",
    source: "https://www.etisalat.eg/",
    official: true,
  },
  we_pay: null,
  instapay: null,
  fawry: null,
  valu: null,
  aman: null,
  contact: null,
  money_fellows: null,
  telda: null,
  khazna: null,
  lucky: null,
  sympl: null,
  souhoola: null,
  paymob: null,
  meeza: null,
  opay: null,
  shahry: null,
  tabby: null,
  tamara: null,
  thndr: null,
  klivvr: null,
  bokra: null,
  mnt_halan: null,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function normalizeSvg(rawSvg) {
  let svg = rawSvg.trim();
  if (!svg.includes("<svg")) throw new Error("Not an SVG document");

  svg = svg.replace(/<\?xml[^?]*\?>/gi, "").replace(/<!DOCTYPE[^>]*>/gi, "");

  let box = parseViewBox(svg);
  if (!box) {
    const dims = parseDimensions(svg);
    if (dims) box = { minX: 0, minY: 0, width: dims.width, height: dims.height };
  }
  if (!box) box = { minX: 0, minY: 0, width: 100, height: 100 };

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

async function downloadSvg(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "NUME-LogoCollector/1.0 (+https://github.com/ahamgad/nume-app)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (!text.includes("<svg")) throw new Error("Response is not SVG");
  return text;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  /** @type {Array<{ institutionId: string; status: string; logoPath: string | null; isOfficial?: boolean; lastUpdated?: string; source?: string }>} */
  const registry = [];

  for (const [id, spec] of Object.entries(MANIFEST)) {
    if (!spec) {
      registry.push({ institutionId: id, status: "fallback", logoPath: null });
      continue;
    }

    const outPath = join(OUT_DIR, `${id}.svg`);
    try {
      const raw = await downloadSvg(spec.url);
      const normalized = normalizeSvg(raw);
      await writeFile(outPath, normalized, "utf8");
      registry.push({
        institutionId: id,
        status: "available",
        logoPath: `/institutions/${id}.svg`,
        isOfficial: spec.official ?? true,
        lastUpdated: TODAY,
        source: spec.source,
      });
      console.log(`✓ ${id}`);
    } catch (error) {
      console.warn(`✗ ${id}: ${error.message}`);
      registry.push({ institutionId: id, status: "fallback", logoPath: null });
    }

    await sleep(DELAY_MS);
  }

  await writeFile(
    REGISTRY_PATH,
    JSON.stringify({ generatedAt: TODAY, entries: registry }, null, 2),
    "utf8",
  );

  const available = registry.filter((e) => e.status === "available").length;
  console.log(`\nCollected ${available}/${registry.length} logos → ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
