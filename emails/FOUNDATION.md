# NUME Email Foundation V2

Official source of truth for every NUME email. All templates **must** consume the shared foundation renderer — do not fork shell HTML per template.

**Implementation:** `src/lib/email/foundation/`  
**Artifacts:** `npm run emails:generate` → `emails/*/preview-*.html` + hosted PNG marks

The previous auth-only email baseline (`emails/auth/SPEC.md`) is superseded by this document.

---

## Design philosophy

- Minimal, premium, calm
- Matches Authentication V2 hierarchy and spacing rhythm
- NUME branding only — no third-party visual identity
- Table-based layout with inline CSS fallbacks
- Light and Dark Mode via `color-scheme` + `prefers-color-scheme`
- Mobile-first, max content width `400px`

---

## Building blocks

Every email is assembled from these blocks in order:

1. **Outer canvas** — full-width background (`--background`)
2. **Content container** — centered column, max `400px`
3. **Card surface** — bordered container (`--card`, 16px radius, 16px padding)
4. **Logo area** — hosted NUME mark, 48×48, 8px radius
5. **Title** — primary headline
6. **Supporting description** — one short sentence (optional)
7. **Primary content block** — template-specific (OTP code, CTA, etc.)
8. **Informational / helper section** — muted caption inside card (optional)
9. **Footer** — copyright outside card

---

## Vertical rhythm

Aligned with Authentication V2 (`AuthCard` / `auth-layout.tsx`):

| Gap | Value |
|---|---|
| Canvas inset (vertical / horizontal) | `24px` / `16px` |
| Card padding | `16px` |
| Logo → Title | `12px` |
| Title → Description | `12px` |
| Description → Primary block | `16px` |
| Primary block → Helper | `16px` |
| Card → Footer | `24px` |

---

## Typography scale

| Role | Size | Weight | Line height |
|---|---|---|---|
| Title | `24px` | 600 | 1.25 |
| Description | `15px` | 400 | 1.5 |
| Primary block (OTP code) | `32px` | 600 | 1.2 |
| Helper / caption | `13px` | 400 | 1.45 |
| Footer | `12px` | 400 | 1.4 |

Font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`

---

## Color tokens

Values are baked as hex/rgba in HTML because most clients strip CSS variables.

### Light

| Token | Value | App source |
|---|---|---|
| Canvas | `#F7F7F7` | `--background` |
| Card | `#FFFFFF` | `--card` |
| Border | `#EFEFEF` | `--border` |
| Foreground | `#252525` | `--foreground` |
| Muted | `#8E8E8E` | `--muted-foreground` |
| Code surface | `#FFFFFF` | input background |
| Code border | `#EFEFEF` | `--border` |

### Dark

| Token | Value | App source |
|---|---|---|
| Canvas | `#1A1A1A` | `--background` (dark) |
| Card | `#262626` | `--card` (dark) |
| Border | `rgba(255,255,255,0.10)` | `--border` (dark) |
| Foreground | `#FAFAFA` | `--foreground` (dark) |
| Muted | `#B0B0B0` | `--muted-foreground` (dark) |
| Code surface | `#262626` | card surface |
| Code border | `rgba(255,255,255,0.15)` | input border |

Dark mode is applied with `@media (prefers-color-scheme: dark)` in a `<style>` block. Light values remain inline as the universal fallback.

---

## Corner radius

| Element | Radius |
|---|---|
| Card | `16px` |
| Logo mark | `8px` |
| Primary content block (OTP) | `8px` |

No card shadow.

---

## Logo

| Rule | Value |
|---|---|
| Light asset | `{{ .SiteURL }}/email/nume-mark-light.png` |
| Dark asset | `{{ .SiteURL }}/email/nume-mark-dark.png` |
| Display size | `48×48` |
| Wordmark | None (`alt="NUME"`) |

---

## Primary content block — OTP pattern

- Full-width bordered surface inside card
- Centered tabular numerals
- `letter-spacing: 0.28em` for digit separation
- Minimum height `56px`

---

## Footer

Centered, outside card:

```
2026 © NUME
```

---

## Technical requirements

- Table-based layout + inline CSS
- Outlook (`mso`) font fallback
- `color-scheme: light dark` meta
- Hosted PNG logos (no inline SVG)
- Hidden preheader text
- No duplicated shell HTML — templates supply content only
- Escape all dynamic copy at render time (previews); Supabase Go templates for production OTP

---

## Reference adaptation notes

The reference informed **structure only** (logo → title → body → focal block → helper → footer). NUME-specific decisions:

- Spacing matches Authentication V2, not generic marketing email padding
- OTP code block mirrors in-app OTP cell typography rather than a button-style CTA
- Dark mode uses product dark tokens, not reference palette
- No illustrations, social links, or secondary actions
