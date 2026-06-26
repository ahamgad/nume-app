import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildCurtainRevealPolygon,
  getCurtainTravelDistance,
  getCurtainTranslations,
  getMaxSplashRemainderWidth,
  getSplashLogoLayout,
  parseCurtainCorridorPoints,
} from "@/lib/app/splash-curtain-geometry";
import {
  NUME_SPLASH_CURTAIN_SVG_PATHS,
  NUME_SPLASH_CURTAIN_STROKE_PATHS,
  NUME_SPLASH_STROKE_ORDER,
  NUME_SPLASH_STROKE_PATHS,
  NUME_SPLASH_STROKE_SVG_PATHS,
  NUME_SPLASH_LOGO_SIZE_PX,
  NUME_SPLASH_VIEWBOX_SIZE,
  NUME_SPLASH_WORDMARK_GAP_PX,
  NUME_SPLASH_WORDMARK_SIZE_PX,
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
  it("defines two synchronized intro draw paths", () => {
    expect(NUME_SPLASH_STROKE_ORDER).toHaveLength(2);
    expect(Object.keys(NUME_SPLASH_STROKE_PATHS)).toEqual(["path1", "path2"]);
  });

  it("matches docs/brand-sublime-stroke.svg path data exactly", () => {
    const sourcePaths = readSvgPathData("docs/brand-sublime-stroke.svg");

    expect(NUME_SPLASH_STROKE_SVG_PATHS).toEqual(sourcePaths);
    expect(NUME_SPLASH_STROKE_PATHS.path1).toBe(sourcePaths[0]);
    expect(NUME_SPLASH_STROKE_PATHS.path2).toBe(
      "M89.5833 79.1667L70.8333 20.8333L61.4583 50",
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
  const viewport = { width: 390, height: 844 };
  const logoScale = NUME_SPLASH_LOGO_SIZE_PX / NUME_SPLASH_VIEWBOX_SIZE;
  const logoCenter = {
    x: viewport.width / 2,
    y:
      viewport.height / 2 -
      (NUME_SPLASH_WORDMARK_SIZE_PX + NUME_SPLASH_WORDMARK_GAP_PX) / 2,
  };
  const layout = getSplashLogoLayout(viewport, logoCenter);

  it("widens the reveal corridor as curtain progress increases", () => {
    const closed = buildCurtainRevealPolygon(0, 0, viewport, layout);
    const open = buildCurtainRevealPolygon(-120, 120, viewport, layout);

    expect(closed).not.toBe(open);
    expect(getCurtainTravelDistance(viewport, layout)).toBeGreaterThan(200);
  });

  it("spans the full viewport height at every travel step", () => {
    for (const progress of [0, 0.35, 0.7, 1]) {
      const { screenTravel } = getCurtainTranslations(
        progress,
        viewport,
        layout,
        logoScale,
      );
      const polygon = buildCurtainRevealPolygon(
        -screenTravel,
        screenTravel,
        viewport,
        layout,
      );
      const points = parseCurtainCorridorPoints(polygon);

      expect(points).toHaveLength(4);
      expect(points[0]?.y).toBe(0);
      expect(points[1]?.y).toBe(0);
      expect(points[2]?.y).toBe(viewport.height);
      expect(points[3]?.y).toBe(viewport.height);
    }
  });

  it("keeps stroke translations aligned with corridor travel", () => {
    for (const progress of [0, 0.5, 1]) {
      const { screenTravel, path3TranslateX, path4TranslateX } =
        getCurtainTranslations(progress, viewport, layout, logoScale);

      expect(path3TranslateX).toBe(-screenTravel / logoScale);
      expect(path4TranslateX).toBe(screenTravel / logoScale);
      expect(path3TranslateX).toBe(-path4TranslateX);
    }
  });

  it("clears all viewport corners at curtainProgress = 1", () => {
    const viewports = [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
      { width: 393, height: 852 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 844, height: 390 },
    ];

    for (const size of viewports) {
      const center = {
        x: size.width / 2,
        y:
          size.height / 2 -
          (NUME_SPLASH_WORDMARK_SIZE_PX + NUME_SPLASH_WORDMARK_GAP_PX) / 2,
      };
      const screenLayout = getSplashLogoLayout(size, center);
      const travel = getCurtainTravelDistance(size, screenLayout);

      expect(
        getMaxSplashRemainderWidth(size, screenLayout, travel),
      ).toBeLessThan(0.01);
    }
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
