import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildCurtainRevealPolygon,
  getCurtainTravelDistance,
  getSplashLogoLayout,
} from "@/lib/app/splash-curtain-geometry";
import {
  NUME_SPLASH_CURTAIN_SVG_PATHS,
  NUME_SPLASH_CURTAIN_STROKE_PATHS,
  NUME_SPLASH_STROKE_ORDER,
  NUME_SPLASH_STROKE_PATHS,
  NUME_SPLASH_STROKE_SVG_PATHS,
} from "@/lib/app/splash-stroke-paths";
import {
  SPLASH_CURTAIN_PATH_KEYS,
  SPLASH_LETTER_STEP_MS,
  SPLASH_STROKE_DRAW_MS,
} from "@/lib/app/splash-animation-timings";

function readSvgPathData(relativePath: string): string[] {
  const svg = fs.readFileSync(
    path.join(process.cwd(), relativePath),
    "utf8",
  );
  return [...svg.matchAll(/\sd="([^"]+)"/g)].map((match) => match[1]);
}

describe("splash stroke paths", () => {
  it("defines three synchronized intro draw paths", () => {
    expect(NUME_SPLASH_STROKE_ORDER).toHaveLength(3);
    expect(Object.keys(NUME_SPLASH_STROKE_PATHS)).toEqual([
      "path1",
      "path2",
      "path3",
    ]);
  });

  it("matches docs/brand-sublime-stroke.svg path data exactly", () => {
    const sourcePaths = readSvgPathData("docs/brand-sublime-stroke.svg");

    expect(NUME_SPLASH_STROKE_SVG_PATHS).toEqual(sourcePaths);
    expect(NUME_SPLASH_STROKE_PATHS.path1).toBe(sourcePaths[0]);
    expect(NUME_SPLASH_STROKE_PATHS.path2).toBe(
      "M89.5833 20.8333L70.8333 79.1667",
    );
    expect(NUME_SPLASH_STROKE_PATHS.path3).toBe(
      "M61.4583 50L70.8333 79.1667",
    );
  });

  it("matches docs/brand-sublime-curtin.svg curtain path data exactly", () => {
    const sourcePaths = readSvgPathData("docs/brand-sublime-curtin.svg");

    expect(NUME_SPLASH_CURTAIN_SVG_PATHS).toEqual(sourcePaths);
    expect(NUME_SPLASH_CURTAIN_STROKE_PATHS.path3).toBe(
      "M29.1667 20.8333L47.9167 79.1667",
    );
    expect(NUME_SPLASH_CURTAIN_STROKE_PATHS.path4).toBe(
      "M52.0833 20.8333L70.8333 79.1667",
    );
  });

  it("uses path3 and path4 for the curtain reveal", () => {
    expect(SPLASH_CURTAIN_PATH_KEYS).toEqual(["path3", "path4"]);
  });
});

describe("splash curtain geometry", () => {
  it("widens the reveal corridor as curtain progress increases", () => {
    const viewport = { width: 400, height: 800 };
    const layout = getSplashLogoLayout(viewport, {
      x: viewport.width / 2,
      y: viewport.height / 2 - 13,
    });
    const closed = buildCurtainRevealPolygon(0, 0, viewport, layout);
    const open = buildCurtainRevealPolygon(-120, 120, viewport, layout);

    expect(closed).not.toBe(open);
    expect(getCurtainTravelDistance(viewport)).toBeGreaterThan(200);
  });
});

describe("splash animation timings", () => {
  it("keeps stroke draw duration stable for tuning", () => {
    expect(SPLASH_STROKE_DRAW_MS).toBeGreaterThan(500);
  });

  it("uses linear 200ms letter steps across each 1200ms intro loop", () => {
    expect(SPLASH_LETTER_STEP_MS).toBe(200);
    expect(SPLASH_STROKE_DRAW_MS).toBe(SPLASH_LETTER_STEP_MS * 6);
  });
});
