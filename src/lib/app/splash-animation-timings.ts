/** Linear letter cadence — one step every 200ms within a 1200ms intro loop. */
export const SPLASH_LETTER_STEP_MS = 200;

/** One full intro loop: blank → N → NU → NUM → NUME → hold (6 × 200ms). */
export const SPLASH_STROKE_DRAW_MS = SPLASH_LETTER_STEP_MS * 6;

/** Stage 3 — full logo opacity fade (once, after the final intro loop). */
export const SPLASH_LOGO_FADE_MS = 480;

/** Stage 4 — curtain paths translate outward. */
export const SPLASH_CURTAIN_MS = 760;

export const SPLASH_MOTION_EASE = [0.45, 0.05, 0.2, 1] as const;

export const SPLASH_CURTAIN_PATH_KEYS = ["path3", "path4"] as const;
