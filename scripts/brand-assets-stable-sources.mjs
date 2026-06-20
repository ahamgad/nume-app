/**
 * Validation-approved stable brand sources.
 * Overrides Tier A App Store icons when campaign/seasonal art or lockups
 * are not acceptable for long-term NUME use.
 *
 * @see docs/INSTITUTION_BRAND_ASSETS.md
 */

/** @typedef {{ tier: "B" | "C"; format: "png" | "svg"; url: string; source: string; cropViewBox?: [number, number, number, number]; pngCrop?: { left: number; top: number; width: number; height: number } }} StableSourceEntry */

/** @type {Record<string, StableSourceEntry>} */
export const STABLE_SOURCE_OVERRIDES = {
  contact: {
    tier: "B",
    format: "svg",
    url: "https://contact.eg/favicon.svg",
    source: "https://contact.eg/",
  },
  orange_cash: {
    tier: "B",
    format: "svg",
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg",
    source: "https://commons.wikimedia.org/wiki/File:Orange_logo.svg",
  },
  etisalat_cash: {
    tier: "B",
    format: "svg",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Eand_Logo_EN.svg",
    source: "https://www.etisalat.ae/",
  },
  instapay: {
    tier: "B",
    format: "png",
    url: "https://www.instapay.eg/wp-content/uploads/2022/03/cropped-logo-192x192.png",
    source: "https://www.instapay.eg/",
  },
  qnb_alahli: {
    tier: "B",
    format: "png",
    url: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/12/9d/0b/129d0b28-b587-c311-f576-c9bd54b12e3a/AppIcon-1x_U007emarketing-0-6-0-85-220-0.png/512x512bb.jpg",
    source: "https://www.qnb.com.eg/ (QNB arrow mark, cropped)",
    /** Remove the app-specific "MOBILE" footer bar. */
    pngCrop: { left: 0, top: 0, width: 1, height: 0.72 },
  },
};

/** Prefer fallback avatar over unstable marketing artwork. */
export const VALIDATION_FALLBACK_IDS = ["tamara", "we_pay"];
