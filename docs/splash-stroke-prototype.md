# Splash Stroke Prototype (Feature Flag)

Flag: `SPLASH_USE_STROKE_PROTOTYPE` in `src/lib/app/splash-feature-flags.ts`  
**Default: `false`** — production uses the orbit splash.

## Concept

Sequential SVG stroke-draw of simplified NUME logo paths, followed by wordmark fade-in. Total prototype timing targets ~760ms of stroke motion (under the 800ms splash minimum).

## How to preview locally

1. Set `SPLASH_USE_STROKE_PROTOTYPE = true` in `splash-feature-flags.ts`
2. Run `npm run dev`
3. Clear session storage / cold-start to `/splash`

## Feasibility

| Aspect | Assessment |
|--------|------------|
| Visual quality | Stroke reveal feels intentional and financial; less “loader-like” than orbit |
| Brand fidelity | Simplified paths approximate the flatten mark; full fidelity needs traced SVG paths per theme |
| Timing | Fits ~800ms splash budget; wordmark can appear as strokes complete |
| Performance | Lightweight CSS `stroke-dashoffset` — no extra libraries |
| Dark mode | Single `currentColor` stroke adapts cleanly |
| Reduced motion | Falls back to fully drawn strokes |

## Performance considerations

- Three path animations + wordmark are GPU-friendly
- No additional network requests
- Prototype shares the same init-gated exit logic as production orbit splash

## Recommendation

**Keep Orbit (for now).**

Reasons:
1. Orbit is already shipped, polished, and PO-familiar from prior QA passes
2. Stroke reveal needs design review on real logo geometry (both light/dark assets) before defaulting
3. Orbit reads clearly at small PWA icon scale; stroke detail may feel busy on low-DPI devices
4. Stroke prototype is ready for A/B evaluation — enable the flag for PO comparison in a future session

If PO prefers stroke after side-by-side review, promote prototype CSS/markup into `SplashScreen` and retire orbit animations in a dedicated follow-up (not Phase 3.1 closeout).
