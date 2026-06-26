"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import {
  getIntroStrokeAnimate,
  getIntroStrokeTransition,
  introStrokeDrawTarget,
  introStrokeHidden,
  SPLASH_INTRO_STROKE_HOLD_BEFORE_ERASE_MS,
  type IntroStrokePhase,
} from "@/lib/app/splash-intro-stroke-motion";
import {
  NUME_SPLASH_STROKE_ORDER,
  NUME_SPLASH_STROKE_PATHS,
  NUME_SPLASH_VIEWBOX_SIZE,
} from "@/lib/app/splash-stroke-paths";
import { cn } from "@/lib/utils";

interface SplashIntroStrokesProps {
  /** Rendered width and height in px. */
  size?: number;
  strokeWidth?: number;
  className?: string;
  /** When true, continuously draw and erase like the splash intro loop. */
  loop?: boolean;
  /** When false, play a single draw cycle and hold. */
  reducedMotion?: boolean;
}

export function SplashIntroStrokes({
  size = 24,
  strokeWidth = 2.5,
  className,
  loop = true,
  reducedMotion = false,
}: SplashIntroStrokesProps) {
  const [phase, setPhase] = useState<IntroStrokePhase>("drawing");
  const [loopIndex, setLoopIndex] = useState(0);
  const eraseHandledRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion || !loop) return;
    if (phase !== "drawing") return;

    eraseHandledRef.current = false;
  }, [loop, loopIndex, phase, reducedMotion]);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current !== null) {
        window.clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  function handleAnimationComplete(index: number) {
    if (reducedMotion || !loop) return;
    if (index !== NUME_SPLASH_STROKE_ORDER.length - 1) return;

    if (phase === "drawing") {
      holdTimerRef.current = window.setTimeout(() => {
        holdTimerRef.current = null;
        setPhase("erasing");
      }, SPLASH_INTRO_STROKE_HOLD_BEFORE_ERASE_MS);
      return;
    }

    if (phase === "erasing") {
      if (eraseHandledRef.current) return;
      eraseHandledRef.current = true;
      setPhase("drawing");
      setLoopIndex((current) => current + 1);
    }
  }

  const animate = reducedMotion
    ? introStrokeDrawTarget
    : getIntroStrokeAnimate(phase);
  const transition = reducedMotion
    ? { duration: 0 }
    : getIntroStrokeTransition(phase);
  const loopKey = `intro-strokes-${loopIndex}`;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${NUME_SPLASH_VIEWBOX_SIZE} ${NUME_SPLASH_VIEWBOX_SIZE}`}
      width={size}
      height={size}
      className={cn("shrink-0 text-foreground", className)}
      overflow="visible"
    >
      {NUME_SPLASH_STROKE_ORDER.map((key, index) => (
        <motion.path
          key={`${loopKey}-${key}`}
          d={NUME_SPLASH_STROKE_PATHS[key]}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={introStrokeHidden}
          animate={animate}
          transition={transition}
          onAnimationComplete={() => handleAnimationComplete(index)}
        />
      ))}
    </svg>
  );
}
