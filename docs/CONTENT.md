# NUME content standards

English copy in NUME uses **sentence case** by default.

Governance: copy rules are **frozen foundation** requirements. See **`docs/FOUNDATION.md`** § 10 (typography & copy) and § 12 (future screen rule).

## Sentence case rule

Capitalize only the first word (and proper nouns, brand names, acronyms).

**Correct**

- Create account
- Add record
- Account details
- Recent records
- Current account
- Savings account
- Credit card
- Coming soon
- Interest destination
- No accounts found

**Avoid**

- Create Account
- Add Record
- Account Details
- Recent Records
- Current Account
- Interest Destination

## Do not change

- Brand names (NUME, institution names)
- Acronyms (EGP, NBE, CIB)
- User-entered values (account names, notes, descriptions, imported data)

## Where this applies

- Screen titles
- Section titles
- CTA buttons
- Form labels
- Helper text and descriptions
- Empty states
- Dialogs and bottom sheets
- Chips and toasts
- Navigation labels
- Validation messages
- Picker labels
- All new UI copy

## Description punctuation

Single-sentence helper descriptions and field hints **do not** end with a period.

**Correct**

- Choose where interest payments will be deposited
- Contributes to your net worth calculation

**Incorrect**

- Choose where interest payments will be deposited.
- Contributes to your net worth calculation.

Multi-sentence copy may use normal punctuation.

## Account creation CTAs

| State | English label | i18n key |
|---|---|---|
| Default | Create account | `accounts.createAccount` |
| Loading | Creating account | `accounts.create.submitting` |

All account creation flows use `AccountCreateActionButton` — do not add per-type create labels.

**Documented exception:** First-account onboarding may use `accounts.add.firstAccount.cta` ("Continue").

## Numeric display

Use shared components only — do not scale decimal digits separately:

- `CurrencyAmount` — inline displays
- `ResponsiveCurrencyAmount` — hero/metric displays
- `formatCurrency` — string formatting

## Implementation

User-facing English strings live in `src/lib/i18n/messages/en.ts`. Add and update strings there in sentence case.

Arabic copy follows natural Arabic conventions in `src/lib/i18n/messages/ar.ts`.

These translation files are the **runtime source of truth**. The application never reads copy from Excel or any other export format.

Future screens must follow these standards automatically — do not inline copy rules in screen files.

## Content Matrix (review artifact)

`NUME Content Matrix.xlsx` is a **review and collaboration artifact only**. It is not part of the application runtime and must not be committed to the repository.

Workflow:

```
en.ts + ar.ts
        ↓
Generate Content Matrix.xlsx   (npm run content-matrix:generate)
        ↓
Human review & copy editing
        ↓
Updated Excel
        ↓
Synchronize changes back into en.ts + ar.ts
```

Generator: `scripts/generate-content-matrix.ts`

The workbook export lives at the repo root when generated locally (`/NUME Content Matrix.xlsx`, gitignored). After review, approved changes are applied to the translation files — not loaded from Excel at runtime.
