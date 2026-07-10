# Authentication V2 — Phase 1

Validates the new email + OTP authentication model inside the installed PWA.

Legacy authentication (login, register, password recovery, callback) remains unchanged.

---

## Prerequisites

Update the Supabase **Magic Link** email template to include the 6-digit code:

```html
<p>Your sign-in code: {{ .Token }}</p>
```

`signInWithOtp` uses the Magic Link template. Confirm signup and recovery templates are unchanged for legacy flows.

---

## Development entry

In development builds only, open `/splash-debug` in the installed PWA and use **Continue with email**.

This route is not linked from the legacy Login screen.

---

## Manual QA checklist

Run inside the **installed PWA**:

1. Open `/splash-debug` → tap **Continue with email**
2. Enter email → **Continue** → receive OTP email
3. Enter 6-digit code → **Continue** → redirect to `/splash`
4. Splash completes → dashboard opens
5. Kill and reopen PWA → session persists
6. Sign out from More → legacy `/login` still works
7. Open `/continue` in Safari → install gate redirects to `/`
8. Wrong OTP → inline error, no session

---

## Success criterion

Email → receive OTP → enter OTP in PWA → session created → application opens.
