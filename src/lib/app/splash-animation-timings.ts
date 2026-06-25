/** Stage 1 — simultaneous stroke draw for all four paths. */
export const SPLASH_STROKE_DRAW_MS = 720;

/** Stage 2 — letter cadence while strokes draw (N → NU → NUM → NUME). */
export const SPLASH_LETTER_STEP_MS = SPLASH_STROKE_DRAW_MS / 4;

/** Stage 3 — full logo opacity fade (starts with letter E). */
export const SPLASH_LOGO_FADE_MS = 480;

/** Stage 4 — curtain paths translate outward. */
export const SPLASH_CURTAIN_MS = 760;

export const SPLASH_MOTION_EASE = [0.45, 0.05, 0.2, 1] as const;

export const SPLASH_CURTAIN_PATH_KEYS = ["path3", "path4"] as const;
