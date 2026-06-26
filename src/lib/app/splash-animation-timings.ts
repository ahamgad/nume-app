/** Linear letter cadence — one step every 200ms within a 1200ms intro loop. */
export const SPLASH_LETTER_STEP_MS = 200;

/** One full intro loop: blank → N → NU → NUM → NUME → hold (6 × 200ms). */
export const SPLASH_STROKE_DRAW_MS = SPLASH_LETTER_STEP_MS * 6;

/** Eased fade when each wordmark letter appears or clears. */
export const SPLASH_WORDMARK_LETTER_FADE_MS = 220;

/** Subtle upward settle while each letter fades in (px). */
export const SPLASH_WORDMARK_LETTER_RISE_PX = 3;

/** Faster reverse erase between intro loops while initialization continues. */
export const SPLASH_STROKE_ERASE_MS = 400;

export const SPLASH_LOGO_FADE_MS = 480;

/** Stage 4 — curtain paths translate outward. */
export const SPLASH_CURTAIN_MS = 760;

export const SPLASH_MOTION_EASE = [0.45, 0.05, 0.2, 1] as const;

/** Organic ease-out for wordmark letter opacity and rise. */
export const SPLASH_WORDMARK_LETTER_EASE = [0.22, 1, 0.36, 1] as const;

export const SPLASH_CURTAIN_PATH_KEYS = ["path3", "path4"] as const;
