# Deployment workflow

NUME uses two permanent Vercel environments on a single project.

| Environment | URL | Git branch | Vercel environment |
|-------------|-----|------------|----------------------|
| **QA / Development** | `https://numeos.vercel.app` | `develop` | Preview (branch domain) |
| **Production** | `https://numeos.app` | `main` | Production |

**Goals**

- Daily QA and PWA install testing happen on one stable origin: `https://numeos.vercel.app`
- Production always reflects what is on `main`: `https://numeos.app`
- Temporary `git-*` preview URLs are for PR review only, not daily QA
- Merge to `main` only after manual QA passes on the QA environment

---

## Branch workflow

```
feature/*  →  develop  →  main
              (QA)        (Production)
```

1. Build on a feature branch locally or via PR previews.
2. Merge the feature into **`develop`** when it is ready for QA.
3. Install or update the PWA from **`https://numeos.vercel.app`** once; keep testing on that origin.
4. After manual QA passes, merge **`develop` → `main`** to release to production.

### Why `develop` instead of “the active feature branch”

Vercel **branch domains bind to one branch name**. You cannot point `numeos.vercel.app` at “whatever feature branch is active today” without manually reassigning the domain in the dashboard on every switch.

Use a long-lived **`develop`** integration branch as the QA target. Feature branches can still get ephemeral PR preview URLs, but daily testing and PWA install should always use the permanent QA domain.

---

## Vercel limitations and practices

Read this before changing dashboard settings.

### 1. Domain assignment is dashboard-only

Branch domains, production domains, and environment targeting are configured in **Vercel → Project → Settings → Domains**. They cannot be declared in `vercel.json`.

After changing domain assignments, push a new commit to the target branch so Vercel attaches the domain to the latest deployment.

### 2. One production branch, many preview branches

- **`main`** is the production branch. Pushes/merges to `main` create **Production** deployments and update production domains (`numeos.app`).
- Every other branch creates **Preview** deployments with generated URLs like `nume-app-git-feat-…-numeos.vercel.app`.

To give QA a stable URL, assign `numeos.vercel.app` to **`develop`** as a **Preview / branch domain**, not as Production.

### 3. `numeos.vercel.app` cannot serve both QA and Production

A domain points to either Production (`main`) or one Preview branch. Today both `numeos.vercel.app` and `numeos.app` serve production builds.

**Target state**

| Domain | Environment | Branch |
|--------|-------------|--------|
| `numeos.app` | Production | `main` |
| `numeos.vercel.app` | Preview | `develop` |

Remove `numeos.vercel.app` from Production when reassigning it to `develop`.

### 4. Deployment Protection (SSO) blocks QA unless configured

Standard Protection applies to Preview deployments and generated preview URLs. That is why branch URLs like `nume-app-git-feat-…-numeos.vercel.app` currently redirect to Vercel SSO.

`numeos.vercel.app` and `numeos.app` are currently **public** because they are treated as production domains.

Once `numeos.vercel.app` becomes a Preview branch domain, it may inherit Preview protection. For manual QA and PWA install testing, make the QA domain publicly accessible using one of:

| Option | When to use |
|--------|-------------|
| **Deployment Protection → Exceptions** — add `numeos.vercel.app` | Best when you want PR previews protected but QA public (Pro + Advanced Deployment Protection, or Enterprise) |
| **Standard Protection** with production domains public | Default; ensure the QA branch domain is exempt or protection scope is “Pre-Production Deployments only” |
| **Protection Bypass for Automation** | CI/automation only; not suitable for human QA in a browser |

Without an exception, QA testers and PWA install flows will hit the Vercel login wall.

### 5. Environment variables are per environment / branch

`NEXT_PUBLIC_APP_URL` drives auth email links and callback URLs (`src/lib/supabase/env.ts`). It must match the origin users actually visit.

Configure in **Vercel → Project → Settings → Environment Variables**:

| Variable | Production (`main`) | Preview branch `develop` | Local |
|----------|---------------------|--------------------------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://numeos.app` | `https://numeos.vercel.app` | `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | same project or prod project | same as QA Supabase project | local/dev project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod key | QA key | local/dev key |

Use **branch-scoped** overrides for `develop` so Preview variables on other branches do not leak into QA.

Redeploy after changing environment variables.

### 6. Supabase Auth redirect URLs

Add **both** origins to Supabase → Authentication → URL configuration:

```
https://numeos.vercel.app/auth/callback
https://numeos.app/auth/callback
```

Also allow any path variants your flows use (`/verify-email`, `/reset-password`, etc.) or use wildcard patterns Supabase supports for your plan.

If QA and Production share one Supabase project, keep **Site URL** on the production origin (`https://numeos.app`) and rely on explicit redirect allow-list entries for QA.

### 7. Cron jobs run on Production only

`vercel.json` cron entries execute only on **Production** deployments (`main` / `numeos.app`). QA on `develop` will not run scheduled jobs. That is expected: holiday sync and similar jobs belong on production.

### 8. PWA install origin is permanent

Install the PWA from `https://numeos.vercel.app` for QA. The installed app is bound to that origin until removed and reinstalled.

Changing QA domain assignment or reinstalling from a different URL requires a fresh PWA install.

### 9. Optional: reduce ephemeral preview noise

To stop deploying every feature branch (optional, not enabled by default):

```json
"git": {
  "deploymentEnabled": {
    "feat/*": false
  }
}
```

PR previews from GitHub will still deploy when Vercel’s Git integration creates them unless disabled in project Git settings. Only enable branch suppression if the team agrees to rely on `develop` for integration testing.

### 10. Optional: staged production promotion (Pro+)

Disable **Auto-assign Custom Production Domains** under Production environment settings to create production builds on `main` without immediately aliasing `numeos.app`. Promote manually after smoke-testing the production build URL.

---

## Current state (2026-07-11)

| Check | Observation |
|-------|-------------|
| `numeos.app` | Public; serves Production (`main`) |
| `numeos.vercel.app` | Public; currently also serves Production — should move to `develop` |
| `nume-app-git-*-numeos.vercel.app` | Preview URLs; SSO-protected |
| Production branch | `main` (expected) |
| QA branch | **`develop` not yet created** — create and assign domain |

---

## One-time Vercel dashboard checklist

Complete in **Vercel → nume-app → Settings**.

### Git

- [ ] **Production Branch** = `main`

### Domains

- [ ] `numeos.app` → **Production**
- [ ] `numeos.vercel.app` → **Preview** → Git branch **`develop`**
- [ ] Confirm `numeos.vercel.app` is **not** assigned to Production

### Deployment Protection

- [ ] Add **`numeos.vercel.app`** to **Deployment Protection Exceptions** (or equivalent) so QA is public
- [ ] Keep generated PR preview URLs protected if desired

### Environment variables

- [ ] `NEXT_PUBLIC_APP_URL` = `https://numeos.app` for **Production**
- [ ] `NEXT_PUBLIC_APP_URL` = `https://numeos.vercel.app` for **Preview**, scoped to branch **`develop`**
- [ ] Supabase keys configured for Production and Preview as intended
- [ ] Redeploy `develop` and `main` after changes

### Supabase (dashboard)

- [ ] Redirect URLs include both QA and Production callback origins
- [ ] Magic Link / OTP template includes `{{ .Token }}` for Auth V2 QA

---

## Repository setup

### Create the QA branch

```bash
git checkout main
git pull
git checkout -b develop
git push -u origin develop
```

Merge active feature work into `develop` for QA:

```bash
git checkout develop
git merge feat/your-feature
git push
```

Vercel deploys `develop`; `https://numeos.vercel.app` updates automatically once the branch domain is configured.

### Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

See `.env.example` for required variables.

### Verify deployment

```bash
# QA should return app HTML (not Vercel SSO)
curl -sI https://numeos.vercel.app | head

# Production
curl -sI https://numeos.app | head
```

Install the PWA from the QA URL, then run manual test plans (for example `docs/AUTH-V2-PHASE-1.md`).

---

## Release checklist

Before merging `develop` → `main`:

- [ ] Feature passed manual QA on `https://numeos.vercel.app`
- [ ] PWA flows tested in standalone mode from QA origin
- [ ] Auth redirects work with `NEXT_PUBLIC_APP_URL=https://numeos.vercel.app` on QA
- [ ] No dependency on ephemeral preview URLs for sign-off
- [ ] After merge, smoke-test `https://numeos.app`
- [ ] Confirm cron-dependent behavior on production if relevant

---

## Related docs

- `docs/phase-2-setup.md` — Supabase project bootstrap
- `docs/AUTH-CONTRACT.md` — auth redirect and session rules
- `docs/AUTH-V2-PHASE-1.md` — OTP QA on installed PWA
- `vercel.json` — cron schedule (production only)
