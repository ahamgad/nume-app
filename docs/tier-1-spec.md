# NUME Tier 1 — Visual & Product Specifications (Baseline)

Approved baseline for Tier 1 implementation. PRD remains the single source of truth.

## Empty State Copywriting Guidelines

All empty states across NUME must follow these principles:

- **Never blame the user.** Avoid copy like "You haven't added…" — use neutral, forward-looking language.
- **Explain why the section matters.** One sentence on the value to the user's financial life.
- **Focus on the user's next step.** When actionable, provide a clear CTA or natural next path.
- **Avoid technical language.** No engine names, formulas, or internal module references.
- **Keep supporting copy concise.** Typically 2–3 lines maximum.
- **Use a calm, confident, and encouraging tone.** Not salesy, not apologetic.
- **Feel intentional, not unfinished.** No "Coming Soon," "Not Yet Available," or disabled aesthetics.

## Approved Copy (Tier 1)

### Planning Empty State

- **Title:** Plan your money with confidence.
- **Body:** Planning helps you understand how your monthly income and expenses shape the decisions ahead.

### Goals Empty State

- **Title:** Turn your financial goals into a plan.
- **Body:** Goals become more meaningful once you understand your current position and monthly capacity.

### More Tab

Lightweight but complete destination:

- Profile (stub with forward-looking copy)
- Appearance (stub showing system theme)
- Language (placeholder for localization phase)
- About NUME (logo, version, short description)
- Logout

## Implementation Requirements

- Touch targets: minimum **44×44 px** on all interactive elements (buttons, tabs, list rows, switches).
- Current Account only in Add Account flow (no type picker).
- Recent Activity hidden when no records exist.
- Account creation: toast + redirect to Account Details (no success screen).
- Dashboard educational widgets: intentional, not disabled.
- Black-and-white visual foundation; no decorative accent colors in Tier 1.
- Localization-ready: i18n keys, logical CSS properties, no hardcoded strings.
