# Auth email UX specification (approved)

Shared shell for Confirm email and Reset password. Design System is the single source of truth; email is a rendering target.

## Shared structure

1. Logo (+ NUME wordmark)
2. Headline
3. Body
4. Primary CTA
5. One-time link note
6. Security note
7. Footer (`© NUME`)

No link-fallback / raw URL section. Single primary CTA only.

## Shared visual foundation

- Canvas → card (border, 16px radius, no shadow)
- Spacing 16 / 24 from product foundations
- Primary CTA ≈ `h-12` full width
- Light product tokens; readable if a client forces dark
- Logo: hosted PNG from brand SVG (`/email/nume-mark.png`)

## Confirm email

| Element | Copy |
|---|---|
| Subject | Confirm your email address |
| Preheader | Tap the link to finish creating your NUME account |
| Headline | Confirm your email address |
| Body | Follow the link below to confirm this email address and finish signing up |
| CTA | Confirm email address |
| One-time note | This link can only be used once to confirm your email |
| Security note | If you didn't create a NUME account, you can safely ignore this email |
| Footer | © NUME |

## Reset password

| Element | Copy |
|---|---|
| Subject | Reset your password |
| Preheader | Tap the link to choose a new password for your NUME account |
| Headline | Reset your password |
| Body | Choose a new password to regain access to your account |
| CTA | Reset password |
| One-time note | This link can only be used once to reset your password |
| Security note | If you didn't request a password reset, you can safely ignore this email |
| Footer | © NUME |

## Delta

Only subject, preheader, headline, body, CTA label/href, one-time note, and security note differ. Shell, layout, spacing, typography, CTA chrome, helper placement, and footer are shared.
