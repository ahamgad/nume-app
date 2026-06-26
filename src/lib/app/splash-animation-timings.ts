/** Linear letter cadence — one step every 200ms within a 1200ms intro loop. */
export const SPLASH_LETTER_STEP_MS = 200;

/** One full intro loop: blank → N → NU → NUM → NUME → hold (6 × 200ms). */
export const SPLASH_STROKE_DRAW_MS = SPLASH_LETTER_STEP_MS * 6;

/** Eased fade when each wordmark letter appears or clears (ease-out interpolation). */
export const SPLASH_WORDMARK_LETTER_FADE_MS = 220;

/** Faster reverse erase between intro loops while initialization continues. */
export const SPLASH_STROKE_ERASE_MS = 400;

export const SPLASH_LOGO_FADE_MS = 480;

/** Stage 4 — curtain paths translate outward. */
export const SPLASH_CURTAIN_MS = 760;

export const SPLASH_MOTION_EASE = [0.45, 0.05, 0.2, 1] as const;

/** Ease-out curve for wordmark letter opacity. */
export const SPLASH_WORDMARK_LETTER_EASE = [0, 0, 0.2, 1] as const;

export const SPLASH_CURTAIN_PATH_KEYS = ["path3", "path4"] as const;
