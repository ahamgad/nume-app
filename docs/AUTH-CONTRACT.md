# Authentication Contract

Architectural contract for NUME authentication. Implementation must conform to this document; deviations require an explicit contract revision.

---

## 1. Source of truth

| Responsibility | Owner | Role |
|----------------|-------|------|
| **Session creation** | Supabase Auth (`verifyOtp`) via `email-otp.ts` | Establishes session after OTP verification; cookies written by Supabase SSR client. |
| **Session refresh** | Middleware (`updateSession`) | Refreshes the Supabase session on each request and propagates cookie updates. |
| **Session validation** | Middleware | Reads the current user via `getUser()` and enforces route access rules. |
| **Session persistence** | Supabase Auth + SSR cookies | Cookies are the persistence layer; no parallel session stores. |
| **Route protection** | Middleware | Redirects unauthenticated users to `/continue`; authenticated users on `/continue` to `/splash`. |
| **Post-auth navigation** | Continue screen (client) | After OTP verification, routes to `/splash`. Splash completes presentation only. |
| **Email sign-in** | Supabase Auth + `/continue` | Supabase sends OTP; user enters code on `/continue`; session established on verify. |

**AuthProvider** mirrors session state for the UI. It does not exchange tokens, enforce routes, or repair failed authentications.

**Splash** waits for readiness and plays the handoff animation. It does not authenticate users.

---

## 2. Authentication lifecycle

```
/continue
  → Enter email
  → Supabase sends OTP
  → Enter 6-digit code
  → Session established (cookies)
  → /splash (presentation gate)
  → Dashboard
```

---

## 3. Invariants

1. **Session before protected routes** — A valid auth session (cookies) must exist before the user enters middleware-protected app routes.
2. **OTP is the sole sign-in path** — `/continue` is the only authentication entry route.
3. **Splash never authenticates** — Splash does not exchange tokens or create sessions.
4. **Middleware never exchanges tokens** — Middleware refreshes and validates only.
5. **AuthProvider never repairs auth** — AuthProvider reflects Supabase state only.
6. **Middleware protects routes only** — Redirect decisions, not token handling.
7. **Auth routes bypass cold-start splash redirect** — `/continue` renders without being forced through the splash bootstrap script.

---

## 4. Public routes

| Route | Purpose |
|-------|---------|
| `/` | Distribution landing (browser) |
| `/continue` | Email + OTP sign-in |
| `/splash` | Presentation gate after auth |

All other app routes require a session.
