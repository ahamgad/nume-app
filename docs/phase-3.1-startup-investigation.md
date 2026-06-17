# Phase 3.1 — Startup Investigation (Final QA Pass 4)

Investigation into post-splash skeleton flashes and the visible lag before the dashboard appears.

## Root cause analysis

### 1. Post-splash skeletons on the dashboard

**Primary cause: hard navigation discarded all splash-time work.**

The splash screen exited via `window.location.replace("/")`. That triggers a **full document reload**, which:

- Destroys the React tree and creates a new `QueryClient` (`QueryProvider` uses `useState(createQueryClient)`).
- Drops the finance query cache populated during splash (`["finance", userId]`).
- Re-runs Supabase auth rehydration (`onAuthStateChange` is async; `isLoading` starts `true`).
- Re-fetches finance from Supabase (`loadFinanceData` including interest processing).

The dashboard net-worth widget renders skeletons when `isFinanceLoading` is true:

```tsx
// dashboard-screen.tsx
{isFinanceLoading ? <Skeleton ... /> : <MetricHero ... />}
```

`isFinanceLoading` is defined as:

```tsx
Boolean(userId) && financeLoading && !isFetched && isOnline
```

After reload, `isFetched` is `false` until the second finance fetch completes — even though splash already waited for `isFinanceReady` (first fetch).

**Secondary contributor: splash readiness vs dashboard loading signals differ.**

- Splash waits for `isFinanceReady` (`isFetched || offline bypass`).
- Dashboard skeleton uses `isFinanceLoading` (initial fetch only).
- These align on first load, but only when data survives navigation. After hard reload, splash progress is lost and the dashboard repeats the loading UX.

**Not the cause (ruled out):**

- Duplicate invalidation on splash exit — `QueryProvider` invalidates on `pageshow`, which fires on full reload but not on client-side navigation.
- Suspense boundaries — dashboard is a client component without route-level Suspense skeletons.
- Expensive selectors — `netWorth` / `certificateInsights` are memoized; they do not block first paint.
- Market snapshots — not part of startup path.

### 2. Visible lag between splash completion and dashboard

**Primary cause: full page reload overhead.**

Timeline before fix (typical authenticated cold start):

| Time | Event |
|------|--------|
| 0ms | Bootstrap script redirects to `/splash` (hard navigation #1) |
| ~50ms | Splash mounts; auth listener attaches |
| ~150–400ms | Supabase session restored; `authLoading → false` |
| ~200ms | Finance query enabled; `loadFinanceData` starts |
| ~600–1200ms | Finance fetch + interest processing completes; `isFinanceReady → true` |
| ~1300ms | Minimum splash duration reached; exit dissolve starts |
| ~1580ms | `markSplashComplete()` + `location.replace("/")` (hard navigation #2) |
| ~1580–2100ms | HTML/JS re-download or cache read, React hydrate, providers mount |
| ~2100–2500ms | Auth rehydrates again; finance query starts **again** |
| ~2500–3500ms | Dashboard mounts; skeletons visible until second finance fetch |
| ~3500ms+ | Dashboard content appears |

The ~400–900ms gap after splash is mostly **second navigation + provider re-init**, not animation.

## Fix applied (low-risk)

**Replace hard navigation with client-side routing on splash exit.**

```tsx
// splash-screen.tsx — after exit animation
markSplashComplete();
router.replace("/");
```

This preserves:

- `QueryClient` cache (finance data from splash)
- Auth state (`user` already set)
- `isFetched === true` on dashboard entry

Expected timeline after fix:

| Time | Event |
|------|--------|
| 0ms | Bootstrap → `/splash` |
| ~150–400ms | Auth resolved |
| ~600–1200ms | Finance ready (same as before) |
| ~1000ms | Splash minimum + exit dissolve |
| ~1280ms | Client `router.replace("/")` — dashboard mounts with cached data |
| ~1280ms+ | Dashboard renders content immediately (no skeleton flash) |

## Recommendations

| Issue | Action | Rationale |
|-------|--------|-----------|
| Hard reload on splash exit | **Implemented** — `router.replace` | Low risk; directly addresses both symptoms |
| Cold-start bootstrap uses `location.replace("/splash")` | **Leave as-is** | Required before React boots; cannot client-navigate |
| `QueryProvider` invalidates finance on every `pageshow` | **Defer** | Useful for bfcache restore; no longer fires on splash exit after fix |
| `staleTime: 0` + refetch on focus | **Defer** | Causes background refetch, not initial skeletons |
| Persist React Query cache (e.g. localStorage) | **Defer** | Higher complexity; unnecessary if SPA navigation is preserved |
| Dashboard skeleton when `!isFinanceReady` instead of `isFinanceLoading` | **Leave as-is** | Correct semantics once cache survives navigation |

## Phase 3.1 closure recommendation

After this fix, cold start should enter a **ready dashboard** when initialization completes during splash. Residual edge cases (very slow network exceeding 1.5s init) may still extend splash — by design.

**Phase 3.1 can proceed to PO sign-off** after live QA confirms:

- No skeleton flash after splash on cold start
- Reduced splash-to-dashboard gap (~280ms exit animation only)
- Background resume and app-switcher kill behaviors unchanged

If PO still sees skeletons, capture network timing — likely slow init exceeding splash wait, not navigation regression.
