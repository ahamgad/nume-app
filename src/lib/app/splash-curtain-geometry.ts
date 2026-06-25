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

export function getCurtainTravelDistance(viewport: ViewportSize): number {
  return viewport.width * 0.62;
}
