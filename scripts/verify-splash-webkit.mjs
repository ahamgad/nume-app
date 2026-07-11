/**
 * One-off WebKit verification for splash N right-side stroke subpaths.
 * Run: node scripts/verify-splash-webkit.mjs
 */
import { webkit } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.SPLASH_DEBUG_URL ?? "http://localhost:3000/splash-debug";
const OUT_DIR = path.join(process.cwd(), ".tmp/splash-webkit-verify");

async function readPathMetrics(page) {
  return page.evaluate(() => {
    const keys = ["openLeft", "openRight", "endLeft", "endRight"];
    return keys.map((key) => {
      const el = document.querySelector(`[data-stroke-key="${key}"]`);
      if (!el) return { key, found: false };
      const cs = getComputedStyle(el);
      const bbox = el.getBBox();
      return {
        key,
        found: true,
        d: el.getAttribute("d"),
        totalLength: el.getTotalLength(),
        dasharray: cs.strokeDasharray,
        dashoffset: cs.strokeDashoffset,
        bbox: { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height },
      };
    });
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await webkit.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Strokes only" }).click();
  await page.getByRole("button", { name: "Resume animation" }).click();
  await page.waitForTimeout(200);

  const mid = await readPathMetrics(page);
  await page.screenshot({ path: path.join(OUT_DIR, "mid-animation.png"), fullPage: true });

  await page.waitForTimeout(500);
  const complete = await readPathMetrics(page);
  await page.screenshot({ path: path.join(OUT_DIR, "complete.png"), fullPage: true });

  await browser.close();

  const parseOffset = (v) => Number.parseFloat(String(v).replace("px", ""));
  const rightMid = mid.filter((m) => m.key === "openRight" || m.key === "endRight");
  const rightComplete = complete.filter((m) => m.key === "openRight" || m.key === "endRight");

  const rightAnimatingMid = rightMid.every(
    (m) => m.found && m.totalLength > 0 && parseOffset(m.dashoffset) < 99,
  );
  const rightVisibleComplete = rightComplete.every(
    (m) => m.found && m.totalLength > 0 && m.bbox.width > 0 && m.bbox.height > 0,
  );

  const report = {
    base: BASE,
    mid,
    complete,
    checks: {
      rightAnimatingMid,
      rightVisibleComplete,
      openRightHasSubpath: complete.find((m) => m.key === "openRight")?.d?.includes(" M"),
      endRightHasSubpath: complete.find((m) => m.key === "endRight")?.d?.includes(" M"),
    },
    pass: rightAnimatingMid && rightVisibleComplete,
  };

  await writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
