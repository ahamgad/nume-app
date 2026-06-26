/** Linear letter cadence — one letter every 180ms. */
export const SPLASH_LETTER_STEP_MS = 180;

/** One full intro loop: stroke draw + N → U → M → E (4 × 180ms). */
export const SPLASH_STROKE_DRAW_MS = SPLASH_LETTER_STEP_MS * 4;

/** Stage 3 — full logo opacity fade (once, after the final intro loop). */
export const SPLASH_LOGO_FADE_MS = 480;

/** Stage 4 — curtain paths translate outward. */
export const SPLASH_CURTAIN_MS = 760;

export const SPLASH_MOTION_EASE = [0.45, 0.05, 0.2, 1] as const;

export const SPLASH_CURTAIN_PATH_KEYS = ["path3", "path4"] as const;
