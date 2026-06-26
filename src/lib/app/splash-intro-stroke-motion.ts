import {
  SPLASH_STROKE_DRAW_MS,
  SPLASH_STROKE_ERASE_MS,
  SPLASH_WORDMARK_LETTER_FADE_MS,
} from "@/lib/app/splash-animation-timings";

export type IntroStrokePhase = "drawing" | "erasing";

/** Pause after draw before erase — matches splash intro loop wordmark hold. */
export const SPLASH_INTRO_STROKE_HOLD_BEFORE_ERASE_MS =
  SPLASH_WORDMARK_LETTER_FADE_MS;

/** Symmetric offset-only intro stroke visibility — hidden when pathOffset = 1. */
export const introStrokeHidden = { pathLength: 1, pathOffset: 1 };

export const introStrokeDrawTarget = { pathLength: 1, pathOffset: 0 };

export const introStrokeEraseTarget = introStrokeHidden;

export const introStrokeDrawTransition = {
  duration: SPLASH_STROKE_DRAW_MS / 1000,
  ease: "linear" as const,
};

export const introStrokeEraseTransition = {
  duration: SPLASH_STROKE_ERASE_MS / 1000,
  ease: "linear" as const,
};

export function getIntroStrokeAnimate(phase: IntroStrokePhase) {
  return phase === "drawing" ? introStrokeDrawTarget : introStrokeEraseTarget;
}

export function getIntroStrokeTransition(phase: IntroStrokePhase) {
  return phase === "drawing"
    ? introStrokeDrawTransition
    : introStrokeEraseTransition;
}
