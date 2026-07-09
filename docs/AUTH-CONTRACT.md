# Authentication Contract

Architectural contract for NUME authentication. Implementation must conform to this document; deviations require an explicit contract revision.

---

## 1. Source of truth

Each responsibility has exactly one owner.

| Responsibility | Owner | Role |
|----------------|-------|------|
| **Session creation** | `/auth/callback` (server route) | Exchanges verification and recovery tokens; writes auth cookies on the redirect response. |
| **Session refresh** | Middleware (`updateSession`) | Refreshes the Supabase session on each request and propagates cookie updates. |
| **Session validation** | Middleware | Reads the current user via `getUser()` and enforces route access rules. |
| **Session persistence** | Supabase Auth + SSR cookies | Cookies are the persistence layer; no parallel session stores. |
| **Route protection** | Middleware | Redirects unauthenticated, unverified, or misplaced users. Does not mutate sessions beyond refresh. |
| **Post-auth navigation** | Auth screens (client) | After a session already exists, screens choose the next route (`/splash`, `/verify-email`, `/login`). Splash completes presentation only. |
| **Email verification** | Supabase Auth + `/auth/callback` | Supabase sends links; callback establishes the verified session; middleware gates unverified access. |
| **Password recovery** | Supabase Auth + `/auth/callback` | Reset email links land on callback; callback establishes a recovery session; `/reset-password` consumes it. |

**AuthProvider** mirrors session state for the UI. It does not exchange tokens, enforce routes, or repair failed authentications.

**Splash** waits for readiness and plays the handoff animation. It does not authenticate users or consume email tokens.

---

## 2. Authentication lifecycle

### Register

```
Register
  → Check your email (/verify-email)
  → User opens verification email
  → /auth/callback (session created, cookies set)
  → /splash (presentation gate)
  → Dashboard (/)
```

Pending verification email may be stored for display on the check-email screen only. It is not a session.

### Login

```
Login (credentials accepted)
  → Session established (Supabase client + cookies via AuthProvider)
  → /splash
  → Dashboard (/)
```

If the account is unverified, Login routes to `/verify-email` instead of `/splash`.

### Password reset

```
Forgot password
  → Reset email sent
  → User opens recovery email
  → /auth/callback (recovery session created, cookies set)
  → /reset-password
  → Update password
  → Sign out
  → Login (with success notice)
```

---

## 3. Invariants

These rules must always hold.

1. **Session before protected routes** — A valid auth session (cookies) must exist before the user enters middleware-protected app routes.
2. **Callback is the sole token consumer** — `/auth/callback` is the only place allowed to exchange verification or recovery tokens (`code`, `token_hash`).
3. **Callback is idempotent** — If token exchange fails but a valid session already exists (e.g. duplicate link prefetch), callback treats the request as success and continues.
4. **Callback cookies travel with redirect** — Session cookies must be attached to the `NextResponse` returned by the callback route.
5. **Splash never authenticates** — Splash does not exchange tokens, read email link parameters, or create sessions.
6. **Middleware never exchanges tokens** — Middleware refreshes and validates only.
7. **AuthProvider never repairs auth** — AuthProvider reflects Supabase state; it does not re-run callback logic or fix broken deep links.
8. **Middleware protects routes only** — Redirect decisions, not token handling.
9. **Auth routes bypass cold-start splash redirect** — Login, register, verify-email, forgot-password, reset-password, and `/auth/callback` render without being forced through the splash bootstrap script.
10. **Unverified users are gated** — Authenticated but unverified users may only access `/verify-email` until `email_confirmed_at` is set.
11. **Recovery route is exempt** — `/reset-password` remains reachable while a recovery session is active, even for verified accounts.
12. **Verification display state is independent of session** — Email shown on the check-email screen must not depend on session lifetime during sign-out transitions.

---

## 4. Out of scope for this contract

- Copy and error-message mapping (downstream of callback failure)
- Auth card visual baseline (layout foundation, not session logic)
- PWA vs browser container session sharing
