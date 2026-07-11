# NUME Email Design System — Auth baseline (frozen)

Official source of truth for authentication emails. Confirm Email, Reset Password, and every future auth template **must** consume the shared renderer — do not fork HTML per template.

**Implementation:** `src/lib/email/design-tokens.ts` + `src/lib/email/render-auth-email.ts`  
**Artifacts:** `npm run emails:generate` → `emails/auth/*.html`

---

## Content hierarchy

1. Logo (mark only)
2. Headline
3. Body
4. Primary CTA
5. Security note *(inside card)*
6. One-time link note *(outside card)*
7. Footer — `2026 © NUME` *(outside card)*

**Prohibited:** raw URLs / link-fallback, secondary buttons, marketing content, social links, unsubscribe blocks, separate wordmark beside the logo.

---

## Layout

| Token | Value |
|---|---|
| Orientation | Mobile-first |
| Max width | `400px` |
| Canvas | `#F7F7F7` |
| Card | `#FFFFFF` |
| Card border | `#EFEFEF` |
| Card radius | `16px` |
| Card padding | `20px` |
| Shadow | None |

---

## Vertical rhythm (default for every auth email)

| Gap | Value |
|---|---|
| Logo → Headline | `16px` |
| Headline → Body | `24px` |
| Body → CTA | `32px` |
| CTA → Security note | `36px` |
| Card → footer block | `24px` |
| One-time note → copyright | `12px` |

Outer canvas inset: `24px` vertical / `16px` horizontal.

---

## Logo

| Rule | Value |
|---|---|
| Asset | Hosted PNG from Design System mark (`/email/nume-mark.png`) |
| Display size | `48×48` |
| Corner radius | `8px` |
| Wordmark | **None** (mark only; `alt="NUME"`) |

---

## Typography (frozen — no redesign)

| Role | Size | Weight | Color |
|---|---|---|---|
| Headline | `22px` / lh `1.3` | 600 | `#252525` |
| Body | `16px` / lh `1.5` | 400 | `#252525` |
| Security / one-time | `13px` / lh `1.45` | 400 | `#8E8E8E` |
| Footer copyright | `12px` / lh `1.4` | 400 | `#8E8E8E` |

Font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`

---

## Primary CTA (default component)

| Rule | Value |
|---|---|
| Width | Full |
| Height | `44px` — do not enlarge unless requested |
| Radius | `10px` |
| Background | `#343434` |
| Label | `#FBFBFB`, `16px` / weight `500` |
| Padding | `12px 16px` |

Single primary CTA only. Callback URLs stay on the existing `token_hash` + `/auth/callback` pattern.

---

## Footer (outside card)

```
[One-time link note]
2026 © NUME
```

Centered. Same structure on every auth email; only the one-time copy differs.

---

## Technical foundation

- Table-based layout + inline CSS
- Outlook (`mso`) font fallback
- Light-mode tokens; `color-scheme: light` / `supported-color-schemes: light`
- Hosted PNG logo (no inline SVG)
- Preheader as hidden preview text
- No duplicated shell HTML — content objects only differ by copy + CTA href

---

## Confirm vs Reset (content delta only)

| Element | Confirm | Reset |
|---|---|---|
| Subject | Confirm your email address | Reset your password |
| Preheader | Tap the link to finish creating your NUME account | Tap the link to choose a new password for your NUME account |
| Headline | Confirm your email address | Reset your password |
| Body | Follow the link below to confirm this email address and finish signing up | Choose a new password to regain access to your account |
| CTA | Confirm email address | Reset password |
| CTA href | `…/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/splash` | `…/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password` |
| Security | If you didn't create a NUME account, you can safely ignore this email | If you didn't request a password reset, you can safely ignore this email |
| One-time | This link can only be used once to confirm your email | This link can only be used once to reset your password |
| Footer | `2026 © NUME` | `2026 © NUME` |

Shell, layout, spacing, typography, logo, CTA chrome, and footer structure are shared and frozen.
