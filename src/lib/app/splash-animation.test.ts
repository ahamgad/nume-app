import { describe, expect, it } from "vitest";

import {
  buildCurtainRevealPolygon,
  getCurtainTravelDistance,
  getSplashLogoLayout,
} from "@/lib/app/splash-curtain-geometry";
import {
  NUME_SPLASH_STROKE_ORDER,
  NUME_SPLASH_STROKE_PATHS,
} from "@/lib/app/splash-stroke-paths";
import {
  SPLASH_CURTAIN_PATH_KEYS,
  SPLASH_LETTER_STEP_MS,
  SPLASH_STROKE_DRAW_MS,
} from "@/lib/app/splash-animation-timings";

describe("splash stroke paths", () => {
  it("defines four synchronized draw paths", () => {
    expect(NUME_SPLASH_STROKE_ORDER).toHaveLength(4);
    expect(Object.keys(NUME_SPLASH_STROKE_PATHS)).toEqual([
      "path1",
      "path2",
      "path3",
      "path4",
    ]);
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
