/**
 * Dev-only guard. Branches using this are eliminated from production builds.
 * Remove `src/dev/` when QA seed is no longer needed.
 */
export const isDevEnvironment = process.env.NODE_ENV === "development";
