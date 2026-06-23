# NUME content standards

English copy in NUME uses **sentence case** by default.

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

## Implementation

User-facing English strings live in `src/lib/i18n/messages/en.ts`. Add and update strings there in sentence case.

Arabic copy follows natural Arabic conventions in `src/lib/i18n/messages/ar.ts`.
