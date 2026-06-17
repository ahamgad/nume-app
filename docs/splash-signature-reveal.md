# Splash Animation — Signature N Reveal (Production)

As of Final QA Pass 3, the production splash uses the **signature N reveal** sequence (orbit retired).

## Sequence

1. **N stroke draw** (~400ms) — left-letter path traced from the flatten mark
2. **Full logo reveal** (~320ms from 360ms) — fade + subtle scale as stroke fades
3. **Wordmark** (~280ms from 560ms) — NUME label appears, tightened below mark
4. **Hold** — until init complete and minimum duration (~1.0s)
5. **Dissolve exit** (~280ms) — gentle fade/scale before dashboard entry

## Timing

| Constant | Value |
|----------|-------|
| `SPLASH_MIN_DURATION_MS` | 1000 |
| `SPLASH_EXIT_ANIMATION_MS` | 280 |

Exit uses **client-side** `router.replace("/")` to preserve finance cache — see `docs/phase-3.1-startup-investigation.md`.

Exit when **init ready** AND **minimum duration** met. Slow init is never artificially capped.

## Preview

Run locally and cold-start to `/splash`. No feature flag required.
