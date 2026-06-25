"use client";

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import {
  SPLASH_CURTAIN_MS,
  SPLASH_LOGO_FADE_MS,
  SPLASH_MOTION_EASE,
  SPLASH_STROKE_DRAW_MS,
} from "@/lib/app/splash-animation-timings";
import {
  buildCurtainRevealPolygon,
  getCurtainTravelDistance,
  getSplashLogoLayout,
} from "@/lib/app/splash-curtain-geometry";
import {
  NUME_SPLASH_LOGO_FILLS,
  NUME_SPLASH_LOGO_SIZE_PX,
  NUME_SPLASH_STAGE_BLOCK_HEIGHT_PX,
  NUME_SPLASH_STROKE_ORDER,
  NUME_SPLASH_STROKE_PATHS,
  NUME_SPLASH_STROKE_WIDTH_PX,
  NUME_SPLASH_VIEWBOX_SIZE,
  NUME_SPLASH_WORDMARK_GAP_PX,
  NUME_SPLASH_WORDMARK_SIZE_PX,
} from "@/lib/app/splash-stroke-paths";
import { DashboardScreen } from "@/components/screens/dashboard-screen";

const WORDMARK = "NUME";

const strokeDrawTransition = {
  duration: SPLASH_STROKE_DRAW_MS / 1000,
  ease: SPLASH_MOTION_EASE,
};

const logoFadeTransition = {
  duration: SPLASH_LOGO_FADE_MS / 1000,
  ease: SPLASH_MOTION_EASE,
};

const curtainTransition = {
  duration: SPLASH_CURTAIN_MS / 1000,
  ease: SPLASH_MOTION_EASE,
};

interface SplashAnimationProps {
  canStartCurtain: boolean;
  reducedMotion: boolean;
  onLogoFadeComplete: () => void;
  onCurtainComplete: () => void;
}

export function SplashAnimation({
  canStartCurtain,
  reducedMotion,
  onLogoFadeComplete,
  onCurtainComplete,
}: SplashAnimationProps) {
  const maskId = useId();
  const safeMaskId = maskId.replace(/:/g, "");
  const strokePathsDrawnRef = useRef(0);
  const [viewport, setViewport] = useState({ width: 390, height: 844 });
  const [visibleLetters, setVisibleLetters] = useState(reducedMotion ? 4 : 0);
  const [strokeDrawComplete, setStrokeDrawComplete] = useState(reducedMotion);
  const [logoFadeStarted, setLogoFadeStarted] = useState(reducedMotion);
  const [logoFadeComplete, setLogoFadeComplete] = useState(reducedMotion);
  const [curtainStarted, setCurtainStarted] = useState(false);

  const path3X = useMotionValue(0);
  const path4X = useMotionValue(0);
  const curtainProgress = useMotionValue(0);
  const letterProgress = useMotionValue(0);
  const innerStrokeOpacity = useMotionValue(reducedMotion ? 0 : 1);

  const logoCenter = useMemo(
    () => ({
      x: viewport.width / 2,
      y:
        viewport.height / 2 -
        (NUME_SPLASH_WORDMARK_SIZE_PX + NUME_SPLASH_WORDMARK_GAP_PX) / 2,
    }),
    [viewport.height, viewport.width],
  );

  const layout = useMemo(
    () => getSplashLogoLayout(viewport, logoCenter),
    [logoCenter, viewport],
  );

  const corridorPoints = useTransform(curtainProgress, (progress) => {
    if (progress <= 0) {
      const center = layout.centerX;
      return `${center},${layout.centerY} ${center},${layout.centerY} ${center},${layout.centerY}`;
    }
    const travel = getCurtainTravelDistance(viewport) * progress;
    return buildCurtainRevealPolygon(-travel, travel, viewport, layout);
  });

  const logoScale = NUME_SPLASH_LOGO_SIZE_PX / NUME_SPLASH_VIEWBOX_SIZE;
  const logoBlockTop = logoCenter.y - NUME_SPLASH_LOGO_SIZE_PX / 2;
  const logoBlockLeft = logoCenter.x - NUME_SPLASH_LOGO_SIZE_PX / 2;
  const logoTransform = `translate(${logoBlockLeft} ${logoBlockTop}) scale(${logoScale})`;

  const splashMaskStyle = curtainStarted
    ? {
        mask: `url(#${safeMaskId})`,
        WebkitMask: `url(#${safeMaskId})`,
      }
    : undefined;

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const unsubscribe = letterProgress.on("change", (value) => {
      const next = Math.min(4, Math.max(0, Math.ceil(value)));
      setVisibleLetters(next);
      if (next >= 4) {
        setLogoFadeStarted(true);
      }
    });

    const controls = animate([
      [
        letterProgress,
        4,
        {
          duration: SPLASH_STROKE_DRAW_MS / 1000,
          ease: SPLASH_MOTION_EASE,
        },
      ],
    ]);

    return () => {
      unsubscribe();
      controls.stop();
    };
  }, [letterProgress, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    if (!logoFadeStarted) return;

    const controls = animate([
      [innerStrokeOpacity, 0, logoFadeTransition],
    ]);

    return () => {
      controls.stop();
    };
  }, [innerStrokeOpacity, logoFadeStarted, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    if (!canStartCurtain || !logoFadeComplete || curtainStarted) return;

    let animationPromise: Promise<void> | undefined;

    const frame = window.requestAnimationFrame(() => {
      setCurtainStarted(true);

      const travel = getCurtainTravelDistance(viewport);
      animationPromise = animate([
        [curtainProgress, 1, curtainTransition],
        [path3X, -travel / logoScale, curtainTransition],
        [path4X, travel / logoScale, curtainTransition],
      ]).then(() => {
        onCurtainComplete();
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      void animationPromise;
    };
  }, [
    canStartCurtain,
    curtainProgress,
    curtainStarted,
    logoFadeComplete,
    logoScale,
    onCurtainComplete,
    path3X,
    path4X,
    reducedMotion,
    viewport,
  ]);

  useEffect(() => {
    if (!reducedMotion || !canStartCurtain || curtainStarted) return;

    const frame = window.requestAnimationFrame(() => {
      setCurtainStarted(true);
      onCurtainComplete();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [canStartCurtain, curtainStarted, onCurtainComplete, reducedMotion]);

  function handleStrokePathComplete() {
    if (reducedMotion) return;
    strokePathsDrawnRef.current += 1;
    if (strokePathsDrawnRef.current >= 4) {
      setStrokeDrawComplete(true);
    }
  }

  function handleLogoFadeComplete() {
    if (!logoFadeStarted || logoFadeComplete) return;
    setLogoFadeComplete(true);
    onLogoFadeComplete();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background">
      {curtainStarted ? (
        <div className="absolute inset-0 z-0">
          <DashboardScreen />
        </div>
      ) : null}

      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 size-full overflow-visible text-foreground"
        width={viewport.width}
        height={viewport.height}
      >
        <defs>
          <mask
            id={safeMaskId}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={viewport.width}
            height={viewport.height}
          >
            <rect width={viewport.width} height={viewport.height} fill="white" />
            {curtainStarted ? (
              <motion.polygon fill="black" points={corridorPoints} />
            ) : null}
          </mask>
        </defs>

        <g transform={logoTransform}>
          <motion.path
            d={NUME_SPLASH_STROKE_PATHS.path3}
            fill="none"
            stroke="currentColor"
            strokeWidth={NUME_SPLASH_STROKE_WIDTH_PX}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ x: path3X }}
            initial={{ pathLength: reducedMotion ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={strokeDrawTransition}
            onAnimationComplete={handleStrokePathComplete}
          />
          <motion.path
            d={NUME_SPLASH_STROKE_PATHS.path4}
            fill="none"
            stroke="currentColor"
            strokeWidth={NUME_SPLASH_STROKE_WIDTH_PX}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ x: path4X }}
            initial={{ pathLength: reducedMotion ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={strokeDrawTransition}
            onAnimationComplete={handleStrokePathComplete}
          />
        </g>
      </svg>

      <div
        className="absolute inset-0 z-10 flex flex-col items-center bg-background text-foreground"
        style={{
          ...splashMaskStyle,
          paddingTop:
            viewport.height / 2 - NUME_SPLASH_STAGE_BLOCK_HEIGHT_PX / 2,
          gap: NUME_SPLASH_WORDMARK_GAP_PX,
        }}
      >
        <svg
          aria-hidden
          width={NUME_SPLASH_LOGO_SIZE_PX}
          height={NUME_SPLASH_LOGO_SIZE_PX}
          viewBox={`0 0 ${NUME_SPLASH_VIEWBOX_SIZE} ${NUME_SPLASH_VIEWBOX_SIZE}`}
          className="shrink-0 overflow-visible"
        >
          {NUME_SPLASH_STROKE_ORDER.map((key) => {
            if (key === "path3" || key === "path4") return null;

            return (
              <motion.path
                key={key}
                d={NUME_SPLASH_STROKE_PATHS[key]}
                fill="none"
                stroke="currentColor"
                strokeWidth={NUME_SPLASH_STROKE_WIDTH_PX}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeOpacity: innerStrokeOpacity }}
                initial={{ pathLength: reducedMotion ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={strokeDrawTransition}
                onAnimationComplete={handleStrokePathComplete}
              />
            );
          })}

          <motion.g
            initial={{ opacity: reducedMotion ? 1 : 0 }}
            animate={{ opacity: logoFadeStarted ? 1 : 0 }}
            transition={logoFadeTransition}
            onAnimationComplete={handleLogoFadeComplete}
          >
            {NUME_SPLASH_LOGO_FILLS.map((d) => (
              <path
                key={d.slice(0, 16)}
                d={d}
                fill="currentColor"
                fillRule="evenodd"
              />
            ))}
          </motion.g>
        </svg>

        <p
          aria-hidden
          className="font-sans font-bold tracking-[0.1em]"
          style={{ fontSize: NUME_SPLASH_WORDMARK_SIZE_PX }}
        >
          {WORDMARK.split("").map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="inline-block"
              style={{ opacity: index < visibleLetters ? 1 : 0 }}
            >
              {letter}
            </span>
          ))}
        </p>
      </div>

      <span className="sr-only">
        {strokeDrawComplete && !curtainStarted ? "Loading NUME" : null}
        {curtainStarted ? "Welcome to NUME" : null}
      </span>
    </div>
  );
}
