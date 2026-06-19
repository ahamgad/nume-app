#!/usr/bin/env node
/**
 * Downloads official institution logos, normalizes SVGs to a square canvas,
 * writes public/institutions/{id}.svg, and refreshes logo-registry-data.json.
 *
 * Run: npm run logos:collect
 */

import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";

const execFileAsync = promisify(execFile);

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "public", "institutions");
const DATA_PATH = join(ROOT, "src/lib/institutions/logo-registry-data.json");
const DELAY_MS = 2500;
const TODAY = new Date().toISOString().slice(0, 10);

/** @typedef {{ url: string; source: string; official?: boolean } | null} LogoSource */

/** @type {Record<string, LogoSource>} */
const MANIFEST = {
  // — Existing pass (Wikimedia / official) —
  cib: {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Cib_Logo.svg",
    source: "https://www.cibeg.com/",
  },
  nbe: {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/32/National_Bank_of_Egypt.svg",
    source: "https://www.nbe.com.eg/",
  },
  banque_misr: {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/49/Banque_Misr.svg",
    source: "https://www.banquemisr.com/",
  },
  banque_du_caire: {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/74/Banque_du_caire_Logo.svg",
    source: "https://www.bdc.com.eg/",
  },
  qnb_alahli: {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/79/Qatar_National_Bank_Logo_%28till_2012%29.svg",
    source: "https://www.qnbalahli.com/",
  },
  hsbc: {
    url: "https://upload.wikimedia.org/wikipedia/commons/a/aa/HSBC_logo_%282018%29.svg",
    source: "https://www.hsbc.com.eg/",
  },
  alexbank: {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Alex_Bank_Logo.svg",
    source: "https://www.alexbank.com/",
  },
  credit_agricole: {
    url: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Cr%C3%A9dit_Agricole_2020_logo.svg",
    source: "https://www.credit-agricole.com.eg/",
  },
  fab: {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/22/First_Abu_Dhabi_Bank_Logo.svg",
    source: "https://www.bankfab.com/",
  },
  adcb: {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/25/Abu_Dhabi_Commercial_Bank_logo.svg",
    source: "https://www.adcb.com.eg/",
  },
  arab_bank: {
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Arab_Bank.svg",
    source: "https://www.arabbank.com.eg/",
  },
  nbk: {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/36/NBK_logo.svg",
    source: "https://www.nbk.com/",
  },
  al_baraka: {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/91/Al_Baraka_Bank_Logo.svg",
    source: "https://www.albaraka.com.eg/",
  },
  suez_canal: {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Suez_Canal_Bank_Logo.svg",
    source: "https://www.scbank.com.eg/",
  },
  vodafone_cash: {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Vodafone_logo_2017.svg",
    source: "https://web.vodafone.com.eg/",
  },
  orange_cash: {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg",
    source: "https://www.orange.eg/",
  },
  etisalat_cash: {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Etisalat_eand_Logo_EN.svg",
    source: "https://www.etisalat.eg/",
  },

  // — Second pass: high-priority banks —
  aaib: {
    url: "https://www.aaib.com/images/favicon.svg",
    source: "https://www.aaib.com/",
  },
  adib: {
    url: "https://upload.wikimedia.org/wikipedia/en/2/2c/ADIB_logo.svg",
    source: "https://www.adib.eg/",
  },
  attijariwafa: {
    url: "https://www.attijariwafabank.com.eg/images/logo.svg",
    source: "https://www.attijariwafabank.com.eg/",
  },
  mashreq: {
    url: "https://upload.wikimedia.org/wikipedia/en/5/5c/Mashreq_logo_2022.svg",
    source: "https://www.mashreq.com/egypt/",
  },
  kfh: {
    url: "https://www.kfh.com/.resources/kfh-templates/webresources/kfh-theme/images/rebranding-2025/site-logo.svg",
    source: "https://www.kfh.com/",
  },
  abk: {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/52/ABK_Logo.svg",
    source: "https://www.abk.eahli.com/",
  },
  bank_abc: {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/0c/BankABCLogo.svg",
    source: "https://www.bank-abc.com/",
  },
  faisal_islamic: {
    url: "https://www.faisalbank.com.eg/assets/images/logo.svg",
    source: "https://www.faisalbank.com.eg/",
  },
  united_bank: {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b2/United_Bank_logo.svg",
    source: "https://www.unitedbank.com.eg/",
  },

  // — Second pass: financial services —
  opay: {
    url: "https://gstatic.opayweb.com/website-ng/img/opay-logo.684aa98.svg",
    source: "https://opayweb.com/",
  },
  tabby: {
    url: "https://cdn.tabby.ai/assets/logo.svg",
    source: "https://tabby.ai/",
  },
  tamara: {
    url: "https://cdn.prod.website-files.com/67c184892f7a84b971ff49d9/68931b49f2808979578bdc64_tamara-text-logo-black-en.svg",
    source: "https://tamara.co/",
  },
  meeza: {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/07/Meeza.svg",
    source: "https://www.egyptianpayments.com/",
  },
  contact: {
    url: "https://contact.eg/favicon.svg",
    source: "https://contact.eg/",
  },
  aman: {
    url: "https://aman.eg/wp-content/uploads/logo-01-1.svg",
    source: "https://aman.eg/",
  },
  klivvr: {
    url: "https://www.klivvr.com/_next/static/media/klivvrText.428a31b4.svg",
    source: "https://www.klivvr.com/",
  },
  paymob: {
    url: "https://d24lr4zqs1tgqh.cloudfront.net/84ef57db-147e-49fa-8640-e8bceb474b42-696d49c90e7d4e9e101be737.svg",
    source: "https://developers.paymob.com/",
  },
  money_fellows: {
    url: "https://www.moneyfellows.com/media/4avajsnr/ic1.svg",
    source: "https://www.moneyfellows.com/",
  },
  mnt_halan: {
    url: "https://halan.com/wp-content/themes/halan/app/images/halan-en-logo.svg",
    source: "https://halan.com/",
  },
  shahry: {
    url: "https://trufinance.app/favicon-production.svg",
    source: "https://shahry.app/",
  },

  // — Fallback (no acceptable official SVG located) —
  saib: null,
  egbank: null,
  emirates_nbd: null,
  hdb: null,
  edbe: null,
  aib: null,
  abe: null,
  bank_nxt: null,
  we_pay: {
    url: "https://te.eg/documents/20117/33935/footer-we-logo.svg",
    source: "https://te.eg/",
  },
  instapay: null,
  fawry: null,
  valu: null,
  telda: null,
  khazna: null,
  lucky: null,
  sympl: null,
  souhoola: null,
  thndr: null,
  bokra: null,
  mid_bank: null,
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

function isSvgDocument(text) {
  const trimmed = text.trim();
  return (
    (/^<\?xml|^<svg/i.test(trimmed) && trimmed.includes("</svg>")) ||
    trimmed.includes("<svg")
  );
}

function normalizeSvg(rawSvg) {
  let svg = rawSvg.trim();
  if (!isSvgDocument(svg)) throw new Error("Not an SVG document");

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

async function downloadSvgViaCurl(url) {
  const { stdout } = await execFileAsync(
    "curl",
    ["-sL", "-A", "NUME-LogoCollector/2.0", url],
    { maxBuffer: 10 * 1024 * 1024 },
  );
  return stdout;
}

async function downloadSvg(url) {
  let text;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "NUME-LogoCollector/2.0 (+https://github.com/ahamgad/nume-app)",
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
    DATA_PATH,
    JSON.stringify({ generatedAt: TODAY, entries: registry }, null, 2),
    "utf8",
  );

  const available = registry.filter((entry) => entry.status === "available").length;
  console.log(`\nCollected ${available}/${registry.length} logos → ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
