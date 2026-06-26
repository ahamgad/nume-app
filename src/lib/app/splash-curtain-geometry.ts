import {
  NUME_SPLASH_CURTAIN_DIAGONALS,
  NUME_SPLASH_LOGO_SIZE_PX,
  NUME_SPLASH_VIEWBOX_SIZE,
} from "@/lib/app/splash-stroke-paths";

interface ViewportSize {
  width: number;
  height: number;
}

export interface SplashLogoLayout {
  centerX: number;
  centerY: number;
  scale: number;
}

export function getSplashLogoLayout(
  viewport: ViewportSize,
  logoCenter?: { x: number; y: number },
): SplashLogoLayout {
  const scale = NUME_SPLASH_LOGO_SIZE_PX / NUME_SPLASH_VIEWBOX_SIZE;
  return {
    centerX: logoCenter?.x ?? viewport.width / 2,
    centerY: logoCenter?.y ?? viewport.height / 2,
    scale,
  };
}

function toScreenPoint(
  localX: number,
  localY: number,
  layout: SplashLogoLayout,
  translateX = 0,
): { x: number; y: number } {
  return {
    x:
      layout.centerX +
      (localX - NUME_SPLASH_VIEWBOX_SIZE / 2) * layout.scale +
      translateX,
    y:
      layout.centerY +
      (localY - NUME_SPLASH_VIEWBOX_SIZE / 2) * layout.scale,
  };
}

function lineAtViewportEdges(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  layout: SplashLogoLayout,
  translateX: number,
  viewport: ViewportSize,
): [{ x: number; y: number }, { x: number; y: number }] {
  const start = toScreenPoint(x1, y1, layout, translateX);
  const end = toScreenPoint(x2, y2, layout, translateX);
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (Math.abs(dx) < 0.001) {
    return [
      { x: start.x, y: 0 },
      { x: start.x, y: viewport.height },
    ];
  }

  const slope = dy / dx;
  const topX = start.x + (0 - start.y) / slope;
  const bottomX = start.x + (viewport.height - start.y) / slope;

  return [
    { x: topX, y: 0 },
    { x: bottomX, y: viewport.height },
  ];
}

/** SVG polygon points for the dashboard reveal corridor (mask cutout). */
export function buildCurtainRevealPolygon(
  path3TranslateX: number,
  path4TranslateX: number,
  viewport: ViewportSize,
  layout: SplashLogoLayout,
): string {
  const left = NUME_SPLASH_CURTAIN_DIAGONALS.path3;
  const right = NUME_SPLASH_CURTAIN_DIAGONALS.path4;

  const [leftTop, leftBottom] = lineAtViewportEdges(
    left.x1,
    left.y1,
    left.x2,
    left.y2,
    layout,
    path3TranslateX,
    viewport,
  );
  const [rightTop, rightBottom] = lineAtViewportEdges(
    right.x1,
    right.y1,
    right.x2,
    right.y2,
    layout,
    path4TranslateX,
    viewport,
  );

  const points = [leftTop, rightTop, rightBottom, leftBottom];
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

/**
 * Minimum screen-space travel so both corridor edges clear all viewport corners
 * at curtainProgress = 1. Path3 shifts left and path4 shifts right, each by
 * this distance.
 */
export function getCurtainTravelDistance(
  viewport: ViewportSize,
  layout: SplashLogoLayout,
): number {
  const left = NUME_SPLASH_CURTAIN_DIAGONALS.path3;
  const right = NUME_SPLASH_CURTAIN_DIAGONALS.path4;

  const [leftTop, leftBottom] = lineAtViewportEdges(
    left.x1,
    left.y1,
    left.x2,
    left.y2,
    layout,
    0,
    viewport,
  );
  const [rightTop, rightBottom] = lineAtViewportEdges(
    right.x1,
    right.y1,
    right.x2,
    right.y2,
    layout,
    0,
    viewport,
  );

  // Left splash remains while the left edge sits inside the viewport (x > 0).
  const minTravelLeft = Math.max(leftTop.x, leftBottom.x, 0);

  // Right splash remains while the right edge falls short of the viewport width.
  const minTravelRight = Math.max(
    viewport.width - rightTop.x,
    viewport.width - rightBottom.x,
    0,
  );

  return Math.max(minTravelLeft, minTravelRight);
}

/** Resting horizontal gap between path3 and path4 in screen pixels. */
export function getCurtainRestSeparationScreenPx(
  layout: SplashLogoLayout,
): number {
  return (
    (NUME_SPLASH_CURTAIN_DIAGONALS.path4.x1 -
      NUME_SPLASH_CURTAIN_DIAGONALS.path3.x1) *
    layout.scale
  );
}

/**
 * Screen-space edge translations for path3/path4 and the corridor mask.
 * At progress 0 both edges coincide at logo center; at progress 1 this matches
 * the legacy `-travel / +travel` envelope.
 */
export function getCurtainEdgeScreenTranslates(
  progress: number,
  viewport: ViewportSize,
  layout: SplashLogoLayout,
): {
  screenTravel: number;
  path3ScreenTranslateX: number;
  path4ScreenTranslateX: number;
} {
  const screenTravel = getCurtainTravelDistance(viewport, layout) * progress;
  const halfRestSeparationScreen = getCurtainRestSeparationScreenPx(layout) / 2;
  const separationClose = 1 - progress;

  return {
    screenTravel,
    path3ScreenTranslateX:
      -screenTravel + halfRestSeparationScreen * separationClose,
    path4ScreenTranslateX:
      screenTravel - halfRestSeparationScreen * separationClose,
  };
}

/** Max splash strip width (px) remaining outside the corridor at a given travel. */
export function getMaxSplashRemainderWidth(
  viewport: ViewportSize,
  layout: SplashLogoLayout,
  travel: number,
): number {
  const polygon = buildCurtainRevealPolygon(-travel, travel, viewport, layout);
  const [leftTop, rightTop, rightBottom, leftBottom] =
    parseCurtainCorridorPoints(polygon);

  let maxRemainder = 0;

  for (let y = 0; y <= viewport.height; y += 1) {
    const t = y / viewport.height;
    const leftX = leftTop.x + t * (leftBottom.x - leftTop.x);
    const rightX = rightTop.x + t * (rightBottom.x - rightTop.x);
    maxRemainder = Math.max(
      maxRemainder,
      Math.max(0, leftX),
      Math.max(0, viewport.width - rightX),
    );
  }

  return maxRemainder;
}

/** Screen-space travel and logo-space stroke translations for a progress value 0–1. */
export function getCurtainTranslations(
  progress: number,
  viewport: ViewportSize,
  layout: SplashLogoLayout,
  logoScale: number,
): {
  screenTravel: number;
  path3TranslateX: number;
  path4TranslateX: number;
} {
  const { screenTravel, path3ScreenTranslateX, path4ScreenTranslateX } =
    getCurtainEdgeScreenTranslates(progress, viewport, layout);

  return {
    screenTravel,
    path3TranslateX: path3ScreenTranslateX / logoScale,
    path4TranslateX: path4ScreenTranslateX / logoScale,
  };
}

export function parseCurtainCorridorPoints(polygon: string): { x: number; y: number }[] {
  return polygon.split(" ").map((pair) => {
    const [x, y] = pair.split(",").map(Number);
    return { x, y };
  });
}
