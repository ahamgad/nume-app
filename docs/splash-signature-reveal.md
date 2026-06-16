# Splash Animation — Signature N Reveal (Production)

As of Final QA Pass 3, the production splash uses the **signature N reveal** sequence (orbit retired).

## Sequence

1. **N stroke draw** (~480ms) — left-letter path traced from the flatten mark
2. **Full logo reveal** (~380ms from 420ms) — fade + subtle scale as stroke fades
3. **Wordmark** (~320ms from 700ms) — NUME label appears
4. **Hold** — until init complete and minimum duration (~1.3s)
5. **Dissolve exit** (~280ms) — gentle fade/scale before dashboard entry

## Timing

| Constant | Value |
|----------|-------|
| `SPLASH_MIN_DURATION_MS` | 1300 |
| `SPLASH_EXIT_ANIMATION_MS` | 280 |

Exit when **init ready** AND **minimum duration** met. Slow init is never artificially capped.

## Preview

Run locally and cold-start to `/splash`. No feature flag required.
