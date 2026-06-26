"use client";

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import {
  SPLASH_CURTAIN_EASE,
  SPLASH_CURTAIN_MS,
  SPLASH_LETTER_STEP_MS,
  SPLASH_LOGO_FADE_MS,
  SPLASH_MOTION_EASE,
  SPLASH_STROKE_DRAW_MS,
  SPLASH_STROKE_ERASE_MS,
  SPLASH_WORDMARK_LETTER_EASE,
  SPLASH_WORDMARK_LETTER_ENTER_OPACITY_EASE,
  SPLASH_WORDMARK_LETTER_EXIT_EASE,
  SPLASH_WORDMARK_LETTER_EXIT_OPACITY_EASE,
  SPLASH_WORDMARK_LETTER_FADE_MS,
  SPLASH_WORDMARK_LETTER_RISE_PX,
} from "@/lib/app/splash-animation-timings";
import {
  buildCurtainRevealPolygon,
  getCurtainTravelDistance,
  getSplashLogoLayout,
} from "@/lib/app/splash-curtain-geometry";
import { isSplashInitializationReady } from "@/lib/app/splash-session";
import {
  NUME_SPLASH_CURTAIN_STROKE_PATHS,
  NUME_SPLASH_CURTAIN_STROKE_WIDTH_PX,
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
import { useFinance } from "@/lib/finance/store";
import { DashboardScreen } from "@/components/screens/dashboard-screen";
import { useAuth } from "@/providers/auth-provider";

const WORDMARK = "NUME";

const LOGO_SCALE = NUME_SPLASH_LOGO_SIZE_PX / NUME_SPLASH_VIEWBOX_SIZE;

type IntroStrokePhase = "drawing" | "erasing";

const introStrokeDrawTransition = {
  duration: SPLASH_STROKE_DRAW_MS / 1000,
  ease: "linear" as const,
};

const introStrokeEraseTransition = {
  duration: SPLASH_STROKE_ERASE_MS / 1000,
  ease: "linear" as const,
};

const logoFadeTransition = {
  duration: SPLASH_LOGO_FADE_MS / 1000,
  ease: SPLASH_MOTION_EASE,
};

const curtainTransition = {
  duration: SPLASH_CURTAIN_MS / 1000,
  ease: SPLASH_CURTAIN_EASE,
};

function getWordmarkLetterTransition(isVisible: boolean) {
  return {
    duration: SPLASH_WORDMARK_LETTER_FADE_MS / 1000,
    opacity: {
      ease: isVisible
        ? SPLASH_WORDMARK_LETTER_ENTER_OPACITY_EASE
        : SPLASH_WORDMARK_LETTER_EXIT_OPACITY_EASE,
    },
    y: {
      ease: isVisible
        ? SPLASH_WORDMARK_LETTER_EASE
        : SPLASH_WORDMARK_LETTER_EXIT_EASE,
    },
  };
}

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
  const { isLoading: authLoading, user } = useAuth();
  const { isFinanceReady } = useFinance();
  const initReady = isSplashInitializationReady({
    authLoading,
    user,
    isFinanceReady,
  });
  const initReadyRef = useRef(initReady);
  const eraseHandledRef = useRef(false);
  const curtainTriggeredRef = useRef(false);

  useEffect(() => {
    initReadyRef.current = initReady;
  }, [initReady]);

  const [viewport, setViewport] = useState({ width: 390, height: 844 });
  const [introLoopIndex, setIntroLoopIndex] = useState(0);
  const [introStrokePhase, setIntroStrokePhase] =
    useState<IntroStrokePhase>("drawing");
  const [introLooping, setIntroLooping] = useState(!reducedMotion);
  const [visibleLetters, setVisibleLetters] = useState(reducedMotion ? 4 : 0);
  const [strokeDrawComplete, setStrokeDrawComplete] = useState(reducedMotion);
  const [logoFadeStarted, setLogoFadeStarted] = useState(reducedMotion);
  const [logoFadeComplete, setLogoFadeComplete] = useState(reducedMotion);
  const [curtainStarted, setCurtainStarted] = useState(false);

  const curtainProgress = useMotionValue(0);
  const innerStrokeOpacity = useMotionValue(reducedMotion ? 0 : 1);

  const curtainTravel = useMemo(
    () => getCurtainTravelDistance(viewport),
    [viewport],
  );

  const path3X = useTransform(curtainProgress, (progress) => {
    return (-curtainTravel * progress) / LOGO_SCALE;
  });
  const path4X = useTransform(curtainProgress, (progress) => {
    return (curtainTravel * progress) / LOGO_SCALE;
  });

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
    const travel = curtainTravel * progress;
    return buildCurtainRevealPolygon(-travel, travel, viewport, layout);
  });

  const dashboardClipPath = useTransform(corridorPoints, (points) => {
    const pairs = points.trim().split(/\s+/).filter(Boolean);
    if (pairs.length < 3) {
      return "none";
    }

    const coords = pairs
      .map((pair) => {
        const [x, y] = pair.split(",").map(Number);
        return `${x}px ${y}px`;
      })
      .join(", ");

    return `polygon(${coords})`;
  });

  const splashMaskStyle = curtainStarted
    ? {
        mask: `url(#${safeMaskId})`,
        WebkitMask: `url(#${safeMaskId})`,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
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
    if (!introLooping) return;
    if (introStrokePhase !== "drawing") return;

    let cancelled = false;
    const letterTimers: number[] = [];

    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return;
      setVisibleLetters(0);
    });

    for (let index = 0; index < 4; index += 1) {
      letterTimers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setVisibleLetters(index + 1);
        }, SPLASH_LETTER_STEP_MS * (index + 1)),
      );
    }

    const loopTimer = window.setTimeout(() => {
      if (cancelled) return;
      setStrokeDrawComplete(true);

      if (initReadyRef.current) {
        setVisibleLetters(4);
        setIntroLooping(false);
        setLogoFadeStarted(true);
        return;
      }

      setVisibleLetters(0);

      const eraseTimer = window.setTimeout(() => {
        if (cancelled) return;
        eraseHandledRef.current = false;
        setIntroStrokePhase("erasing");
      }, SPLASH_WORDMARK_LETTER_FADE_MS);

      letterTimers.push(eraseTimer);
    }, SPLASH_STROKE_DRAW_MS);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      for (const timer of letterTimers) {
        window.clearTimeout(timer);
      }
      window.clearTimeout(loopTimer);
    };
  }, [introLoopIndex, introLooping, introStrokePhase, reducedMotion]);

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
    if (!canStartCurtain || !logoFadeComplete) return;
    if (curtainTriggeredRef.current) return;

    curtainTriggeredRef.current = true;

    let animationPromise: Promise<void> | undefined;

    const frame = window.requestAnimationFrame(() => {
      setCurtainStarted(true);
      curtainProgress.set(0);

      animationPromise = animate(curtainProgress, 1, curtainTransition).then(
        () => {
          onCurtainComplete();
        },
      );
    });

    return () => {
      window.cancelAnimationFrame(frame);
      void animationPromise;
    };
  }, [
    canStartCurtain,
    curtainProgress,
    logoFadeComplete,
    onCurtainComplete,
    reducedMotion,
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

  function handleIntroStrokeAnimationComplete() {
    if (reducedMotion || introStrokePhase !== "erasing") return;
    if (eraseHandledRef.current) return;

    eraseHandledRef.current = true;
    setIntroStrokePhase("drawing");
    setIntroLoopIndex((current) => current + 1);
  }

  function handleLogoFadeComplete() {
    if (!logoFadeStarted || logoFadeComplete) return;
    setLogoFadeComplete(true);
    onLogoFadeComplete();
  }

  const introStrokeHidden = { pathLength: 1, pathOffset: 1 };
  const introStrokeDrawTarget = { pathLength: 1, pathOffset: 0 };
  const introStrokeEraseTarget = introStrokeHidden;
  const introStrokeAnimate =
    introStrokePhase === "drawing"
      ? introStrokeDrawTarget
      : introStrokeEraseTarget;
  const introStrokeTransition =
    introStrokePhase === "drawing"
      ? introStrokeDrawTransition
      : introStrokeEraseTransition;

  const logoScale = LOGO_SCALE;
  const logoBlockTop = logoCenter.y - NUME_SPLASH_LOGO_SIZE_PX / 2;
  const logoBlockLeft = logoCenter.x - NUME_SPLASH_LOGO_SIZE_PX / 2;
  const logoTransform = `translate(${logoBlockLeft} ${logoBlockTop}) scale(${logoScale})`;
  const strokeLoopKey = `intro-${introLoopIndex}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <svg
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 h-0 w-0 overflow-hidden"
      >
        <defs>
          <mask
            id={safeMaskId}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
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
      </svg>

      {curtainStarted ? (
        <motion.div
          className="absolute inset-0 z-0"
          style={{ clipPath: dashboardClipPath }}
        >
          <DashboardScreen />
        </motion.div>
      ) : null}

      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 size-full overflow-visible text-foreground"
        width={viewport.width}
        height={viewport.height}
      >
        {curtainStarted ? (
          <g transform={logoTransform}>
            <motion.path
              d={NUME_SPLASH_CURTAIN_STROKE_PATHS.path3}
              fill="none"
              stroke="currentColor"
              strokeWidth={NUME_SPLASH_CURTAIN_STROKE_WIDTH_PX}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ x: path3X, pathLength: 1 }}
            />
            <motion.path
              d={NUME_SPLASH_CURTAIN_STROKE_PATHS.path4}
              fill="none"
              stroke="currentColor"
              strokeWidth={NUME_SPLASH_CURTAIN_STROKE_WIDTH_PX}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ x: path4X, pathLength: 1 }}
            />
          </g>
        ) : null}
      </svg>

      <div
        className="absolute inset-0 z-10 bg-background text-foreground"
        style={splashMaskStyle}
      >
        <div
          className="flex h-full flex-col items-center"
          style={{
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
          {(introLooping || curtainStarted) &&
            NUME_SPLASH_STROKE_ORDER.map((key, index) => (
              <motion.path
                key={`${strokeLoopKey}-${key}`}
                d={NUME_SPLASH_STROKE_PATHS[key]}
                fill="none"
                stroke="currentColor"
                strokeWidth={NUME_SPLASH_STROKE_WIDTH_PX}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeOpacity: innerStrokeOpacity }}
                initial={introStrokeHidden}
                animate={introStrokeAnimate}
                transition={introStrokeTransition}
                onAnimationComplete={
                  index === NUME_SPLASH_STROKE_ORDER.length - 1
                    ? handleIntroStrokeAnimationComplete
                    : undefined
                }
              />
            ))}

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
          {WORDMARK.split("").map((letter, index) => {
            const isVisible = index < visibleLetters;

            return (
              <motion.span
                key={`${strokeLoopKey}-${letter}-${index}`}
                className="inline-block"
                initial={false}
                animate={{
                  opacity: isVisible ? 1 : 0,
                  y: isVisible ? 0 : SPLASH_WORDMARK_LETTER_RISE_PX,
                }}
                transition={getWordmarkLetterTransition(isVisible)}
              >
                {letter}
              </motion.span>
            );
          })}
        </p>
        </div>
      </div>

      <span className="sr-only">
        {strokeDrawComplete && !curtainStarted ? "Loading NUME" : null}
        {curtainStarted ? "Welcome to NUME" : null}
      </span>
    </div>
  );
}
