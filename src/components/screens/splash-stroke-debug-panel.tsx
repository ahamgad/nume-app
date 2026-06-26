"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
  NUME_SPLASH_STROKE_PATHS,
  NUME_SPLASH_STROKE_ORDER,
  type SplashStrokePathKey,
} from "@/lib/app/splash-stroke-paths";

export type SplashStrokeDebugMode = "strokes-only" | "no-logo" | "production";

type PathMetric = {
  key: SplashStrokePathKey;
  d: string;
  mounted: boolean;
  geometricLength: number;
  normalizedLength: number;
  bbox: { x: number; y: number; width: number; height: number };
  strokeDasharray: string;
  strokeDashoffset: string;
  opacity: string;
  visibility: string;
  display: string;
  animationName: string;
  animationPlayState: string;
  clipPath: string;
  overflow: string;
  color: string;
};

const DEBUG_COLORS: Record<SplashStrokePathKey, string> = {
  path1: "#ef4444",
  path2: "#22c55e",
};

const PATH_ORDER: SplashStrokePathKey[] = [...NUME_SPLASH_STROKE_ORDER];

function SplashStrokeSvg({
  mode,
  showLogo,
  showWordmark,
  freezeAtMs,
}: {
  mode: SplashStrokeDebugMode;
  showLogo: boolean;
  showWordmark: boolean;
  freezeAtMs: number | null;
}) {
  const strokesOnly = mode === "strokes-only";
  const useProductionClasses = mode === "production";

  return (
    <div className="relative flex size-[5.5rem] items-center justify-center border border-dashed border-muted-foreground/40">
      <svg
        data-testid="splash-stroke-debug-svg"
        aria-hidden
        viewBox="0 0 100 100"
        className={
          strokesOnly
            ? "pointer-events-none absolute inset-0 size-full overflow-visible"
            : "nume-splash-n-stroke pointer-events-none absolute inset-0 size-full text-foreground"
        }
        style={freezeAtMs != null ? { animationPlayState: "paused" } : undefined}
      >
        {PATH_ORDER.map((key) => (
          <path
            key={key}
            data-stroke-key={key}
            d={NUME_SPLASH_STROKE_PATHS[key]}
            pathLength="100"
            className={
              useProductionClasses
                ? "nume-splash-n-stroke-path"
                : "nume-splash-stroke-debug-path"
            }
            style={
              strokesOnly
                ? {
                    stroke: DEBUG_COLORS[key],
                    animationDelay: "0ms",
                    animationPlayState:
                      freezeAtMs != null ? "paused" : undefined,
                  }
                : undefined
            }
          />
        ))}
      </svg>

      {showLogo ? (
        <div className="nume-splash-logo-full relative size-full">
          <Image
            src="/brand-flatten-black.svg"
            alt="NUME"
            width={88}
            height={88}
            priority
            className="relative z-0 size-full dark:hidden"
          />
          <Image
            src="/brand-flatten-white.svg"
            alt=""
            width={88}
            height={88}
            priority
            aria-hidden
            className="relative z-0 hidden size-full dark:block"
          />
        </div>
      ) : null}

      {showWordmark ? (
        <p className="absolute -bottom-8 text-xl font-semibold tracking-[0.24em]">
          NUME
        </p>
      ) : null}
    </div>
  );
}

export function SplashStrokeDebugPanel() {
  const [mode, setMode] = useState<SplashStrokeDebugMode>("strokes-only");
  const [freezeAtMs, setFreezeAtMs] = useState<number | null>(200);
  const [metrics, setMetrics] = useState<PathMetric[]>([]);
  const [captureNote, setCaptureNote] = useState("Initial load");

  const showLogo = mode === "production";
  const showWordmark = mode === "production";

  const modeDescription = useMemo(() => {
    switch (mode) {
      case "strokes-only":
        return "Four structural stroke paths (path1–path4) — color-coded";
      case "no-logo":
        return "Step 1 — production stroke classes, logo layer removed";
      case "production":
        return "Production classes with real logo image layer";
      default:
        return "";
    }
  }, [mode]);

  useEffect(() => {
    const svg = document.querySelector<SVGSVGElement>(
      '[data-testid="splash-stroke-debug-svg"]',
    );
    if (!svg) return;

    const readMetrics = () => {
      const svgStyles = getComputedStyle(svg);
      const next = PATH_ORDER.map((key) => {
        const path = svg.querySelector<SVGPathElement>(`[data-stroke-key="${key}"]`);
        if (!path) {
          return {
            key,
            d: NUME_SPLASH_STROKE_PATHS[key],
            mounted: false,
            geometricLength: 0,
            normalizedLength: 0,
            bbox: { x: 0, y: 0, width: 0, height: 0 },
            strokeDasharray: "",
            strokeDashoffset: "",
            opacity: "",
            visibility: "",
            display: "",
            animationName: "",
            animationPlayState: "",
            clipPath: "",
            overflow: svgStyles.overflow,
            color: DEBUG_COLORS[key],
          } satisfies PathMetric;
        }

        const cs = getComputedStyle(path);
        const bbox = path.getBBox();
        return {
          key,
          d: path.getAttribute("d") ?? "",
          mounted: true,
          geometricLength: path.getTotalLength(),
          normalizedLength: path.getTotalLength(),
          bbox: {
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height,
          },
          strokeDasharray: cs.strokeDasharray,
          strokeDashoffset: cs.strokeDashoffset,
          opacity: cs.opacity,
          visibility: cs.visibility,
          display: cs.display,
          animationName: cs.animationName,
          animationPlayState: cs.animationPlayState,
          clipPath: cs.clipPath,
          overflow: svgStyles.overflow,
          color: DEBUG_COLORS[key],
        } satisfies PathMetric;
      });
      setMetrics(next);
    };

    readMetrics();
    const interval = window.setInterval(readMetrics, 100);
    return () => window.clearInterval(interval);
  }, [mode, freezeAtMs]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-lg font-semibold">Splash N Stroke Debug</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Local investigation only — not for production release.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm"
          onClick={() => {
            setMode("strokes-only");
            setCaptureNote("Step 2 — strokes only");
          }}
        >
          Strokes only
        </button>
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm"
          onClick={() => {
            setMode("no-logo");
            setCaptureNote("Step 1 — no logo layer");
          }}
        >
          No logo
        </button>
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm"
          onClick={() => {
            setMode("production");
            setCaptureNote("Production classes + logo placeholder");
          }}
        >
          Production classes
        </button>
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm"
          onClick={() => setFreezeAtMs((value) => (value == null ? 200 : null))}
        >
          {freezeAtMs != null ? "Resume animation" : "Pause ~200ms"}
        </button>
      </div>

      <p className="text-sm">{modeDescription}</p>
      <p className="text-xs text-muted-foreground">Capture: {captureNote}</p>

      <div className="flex justify-center py-8">
        <SplashStrokeSvg
          mode={mode === "no-logo" ? "production" : mode}
          showLogo={mode === "production"}
          showWordmark={showWordmark}
          freezeAtMs={freezeAtMs}
        />
      </div>

      <div className="grid gap-2 text-xs">
        <p className="font-medium">Color key</p>
        <p>Red = path1 · Green = path2</p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2">Path</th>
              <th className="px-3 py-2">Mounted</th>
              <th className="px-3 py-2">Geo length</th>
              <th className="px-3 py-2">BBox</th>
              <th className="px-3 py-2">dasharray</th>
              <th className="px-3 py-2">dashoffset</th>
              <th className="px-3 py-2">opacity</th>
              <th className="px-3 py-2">animation</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.key} className="border-t">
                <td className="px-3 py-2 font-mono">{metric.key}</td>
                <td className="px-3 py-2">{metric.mounted ? "yes" : "no"}</td>
                <td className="px-3 py-2">{metric.geometricLength.toFixed(2)}</td>
                <td className="px-3 py-2 font-mono">
                  {metric.bbox.width.toFixed(1)}×{metric.bbox.height.toFixed(1)} @(
                  {metric.bbox.x.toFixed(1)},{metric.bbox.y.toFixed(1)})
                </td>
                <td className="px-3 py-2 font-mono">{metric.strokeDasharray}</td>
                <td className="px-3 py-2 font-mono">{metric.strokeDashoffset}</td>
                <td className="px-3 py-2">{metric.opacity}</td>
                <td className="px-3 py-2 font-mono">{metric.animationName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
