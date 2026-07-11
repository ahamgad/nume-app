# NUME Writing Patterns

How approved concepts and voice are expressed in the interface.

## Overview

### Purpose

> **This document defines how approved concepts and voice are expressed in the interface.**
>
> **It governs the wording patterns used in labels, messages, helpers, and situational copy — not what concepts mean or how NUME behaves.**

**Question it answers:** How should approved concepts and voice be expressed in the interface?

### Scope

**Owns:** interface labels · helper text · empty states · success and error messages · confirmations · business scenarios · contextual wording · transient system states

Field labels use approved Product Terminology; Writing Patterns governs only the supporting wording around them.

**Does not own:** product concepts (Product Terminology) · communication behavior (Voice & Tone) · writing priorities (Content Principles) · navigation (Navigation & IA)

### Relationship to foundation documents

Apply [Decision precedence](CONTENT-DESIGN-FOUNDATION.md#decision-precedence) when guidance overlaps. Writing Patterns implement what Terminology names and Voice shapes.

| Document | Writing Patterns use it to… |
|---|---|
| Content Principles | Decide whether copy is needed and what to prioritize |
| Product Terminology | Choose approved concepts |
| Voice & Tone | Apply directness, context, guidance, and precision |
| Tone adaptation | Match situation-specific shifts |
| Decision Framework *(future)* | Resolve pattern conflicts and uncovered cases |

Any pattern not yet covered by this document should defer to the Decision Framework until a dedicated pattern is added.

### Global contextual wording rules

These apply across every section below.

1. **Terminology first** — use approved product terms; adapt surface form only when context requires it.
2. **Object names** — add an object name to a label only when it improves clarity (e.g. Add account, Save purchase).
3. **Shortened labels** — shorten a term when surrounding context already makes the full term obvious (e.g. Current account → Current on a typed screen).
4. **Surface variants** — use a variant label when it fits the interface better than the concept name, without creating a new concept (e.g. Available to spend for Available credit on a credit card screen).
5. **Scenario phrasing** — express business scenarios in user-facing copy without adding terminology concepts (e.g. purchase and payment flows on credit products).
6. **No UI duplication** — do not repeat labels, titles, or actions the interface already communicates clearly.
7. **Loading labels** — use the progressive form of the action label on the same control (e.g. Signing in, Creating account).

### Global contextual wording — examples

| Rule | Good (NUME) | Avoid |
|---|---|---|
| Terminology first | **Interest destination** on savings and certificate forms | Interest account, payout account |
| Object names | **Add account**, **Archive account** | Add, Archive (when the action target is unclear) |
| Shortened labels | **Current** on account type chips inside Add account | Current account on every chip |
| Surface variants | **Available to spend** on credit card details | Available credit as the on-screen metric label |
| Scenario phrasing | **Create your account** on registration | Registration as a screen title |
| No UI duplication | Records empty: *Add a record to track balance changes* (no second Add record button in copy) | *Tap Add record below to add a record* |
| Loading labels | **Creating account…** on certificate create submit | Submitting… |

---

## 1. Action labels

**Pattern**  
Labels on buttons, links, and tappable actions.

**When**  
Any control that commits, navigates, or triggers an action.

**Rules**
- Use the product-defined commit action for the entity (Save, Create, Add, etc.)
- Match the label to the user's task on this screen, not a global default
- Include an object name only when global contextual wording rules require it
- Use progressive form on the same control while the action is in progress
- Do not use generic Submit
- Do not harmonize labels across screens without checking context

### Examples

| Scenario | Good | Avoid | Notes |
|---|---|---|---|
| Accounts list header | **Add account** | Create account | Add = enter flow; Create = commit on form |
| Add current account form submit | **Create account** | Save, Submit | Create is the primary commit for a new account |
| Edit account form submit | **Save changes** | Save account | Extra clarity on edit; Terminology: Save |
| Add record form submit | **Save** | Submit record | Entity is clear from screen title **Add income** |
| Certificate create submit | **Create account** | Add certificate | NUME models certificates as accounts; commit action is Create |
| Credit card purchase flow | **Save purchase** | Save, Submit | Object name clarifies the scenario commit |
| Credit card payment flow | **Save payment** | Save expense | Payment is a scenario; engine maps to transfer |
| First-account onboarding sheet | **Continue** | Create account, Next | Advances without committing |
| Archive confirmation | **Archive account** | Archive | Object name required — consequence is account-wide |
| Auth sign-in submit | **Sign in** → **Signing in…** | Submit, Log in | Progressive form on same control |
| Failed net worth load | **Try again** | Retry, Refresh | Recovery surface label — not a terminology noun |

---

## 2. Helper text

**Pattern**  
Supporting copy for fields, sections, and inline UI elements.

**When**  
A field or section needs supporting information that the interface does not already provide.

**Rules**
- Add helper text only when it improves understanding of the field or section
- State the primary message before any supporting detail
- Use one layer of supporting information per message
- Do not repeat the field label in the helper text
- Do not describe the UI or restate visible structure

### Examples

| Scenario | Good | Avoid | Notes |
|---|---|---|---|
| Current balance on add account | *Use the balance you see in your bank app today.* | *Enter your current balance below.* | Explains sourcing, not the field name |
| Principal on add certificate | *The amount locked in this certificate.* | *Principal is the amount you deposit.* | Terminology concept without repeating the label |
| Savings balance method | *Interest uses the minimum balance reached during each posting cycle.* | *This field affects how interest is calculated on your savings account.* | Domain rule the UI cannot show |
| Interest cycle start date | *When interest tracking begins for this account.* | *Select the interest cycle start date.* | Adds meaning beyond the label |
| Include in net worth toggle | *Contributes to your net worth calculation* | *Turn this on to include this account in net worth on the dashboard* | One layer; no UI walkthrough |
| Credit card linked account | *The existing account this credit card is tied to* | *Select linked account from the list below* | Describes relationship, not the control |

---

## 3. Feedback messages

**Pattern**  
Copy that reports the result of a user or system action.

**When**  
After an action succeeds, fails, or cannot complete.

**Rules**
- **Success** — state what completed in one sentence; omit next steps unless the flow continues
- **Error** — lead with what failed; include one supporting detail that helps recovery
- **Validation** — name the field or rule that failed; state what to change
- Apply Tone adaptation: Success & confirmation for success; Errors & failure for errors
- Do not apologize in error messages
- Do not add celebration in success messages

### Examples

| Scenario | Good | Avoid | Notes |
|---|---|---|---|
| Account created | **Account created** | Great! Your account has been created successfully | Success — one fact, no celebration |
| Certificate updated | **Certificate updated** | Changes saved! | Terminology: Save concept; pattern is outcome |
| Purchase recorded | **Purchase recorded** | Expense added to your credit card | Scenario label; not a new terminology concept |
| Income recorded | **Income recorded** | Money has been successfully added | Record type from Terminology |
| Savings validation — annual rate | **Enter a valid annual interest rate** | Invalid rate — please try again | Names field/rule; no apology |
| Savings validation — tiers | **Tiers must connect without gaps or overlaps** | Tier configuration error | States what to fix |
| Email not verified | **Email not verified yet. Check your inbox and try again.** | Sorry, we couldn't verify your email | Error + one recovery step |
| Dashboard net worth load failure | **Couldn't load net worth** | Something went wrong loading your data | Lead with what failed |
| Expense exceeds balance warning | *This expense exceeds your current balance. You can still save the record.* | *Warning: insufficient funds* | Inline feedback — states fact + permission |

---

## 4. Confirmations

**Pattern**  
Copy that asks the user to confirm or dismiss a consequential action.

**When**  
Before destructive, irreversible, or high-impact actions, or when abandoning unsaved work.

**Rules**
- Use a title that names the action; put consequences in the description
- Communicate permanence in the description, not by expanding the button label by default
- Use approved terminology for actions (Archive, Delete, Discard, Cancel)
- Use intent-specific dismiss labels when Cancel alone is ambiguous (e.g. Keep editing)
- Apply Tone adaptation: Destructive actions
- Do not add urgency language to encourage confirmation

### Examples

| Scenario | Good | Avoid | Notes |
|---|---|---|---|
| Archive account | Title: **Archive this account?** · Description: *This removes the account from active views and net worth. Records are preserved.* · Confirm: **Archive account** · Dismiss: **Cancel** | Title: *Are you sure?* · Confirm: **Yes, archive** | Permanence in description; button uses Terminology |
| Permanently delete account | Title: **Permanently delete this account?** · Description: *This removes the account and its records completely. This cannot be undone.* · Confirm: **Delete permanently** | Confirm: **Permanently delete this account and all records forever** | Expanded confirm label only when irreversibility needs emphasis |
| Discard unsaved edits | Title: **Discard changes?** · Description: *Any unsaved changes will be lost.* · Confirm: **Discard** · Dismiss: **Keep editing** | Dismiss: **Cancel** alone on edit screen | Keep editing when Cancel is ambiguous |
| Archive vs delete | Archive description mentions records preserved | Delete description implies reversibility | Distinct consequences — Terminology: Archive · Delete |

---

## 5. Empty states

**Pattern**  
Copy when a list, section, or feature has no content yet.

**When**  
The interface is empty but the area is otherwise available.

**Rules**
- Name what is missing and what belongs in the area
- Point to the first action when the user is expected to begin
- Do not duplicate the primary action the interface already presents
- Keep copy shorter than first-use orientation copy
- Apply Tone adaptation: Absence of content

### Examples

| Scenario | Good | Avoid | Notes |
|---|---|---|---|
| Accounts — no accounts yet | Title: **Your accounts live here** · Body: *Add the account you use every day to start tracking where your money is held* · CTA: **Start with your first account** | Body repeats *Add account* as a second CTA sentence | One outlined CTA; no header Add button when empty |
| Account details — no records | Title: **No records yet** · Body: *Add a record to track balance changes.* | *No records found. Tap the button above to add your first record.* | No UI duplication |
| Archived accounts filter — empty | Title: **No archived accounts** · Body: *Archived accounts appear here and stay out of net worth* | *You haven't archived any accounts yet. Archive an account from its details page.* | Names what belongs here; shorter than onboarding |
| Goals — pre-accounts | Title: **Turn your financial goals into a plan.** · Body points to accounts setup | Full planning tutorial in empty state | Orientation is allowed to be longer — still no duplicate CTA |
| Dashboard — no accounts | Setup card: **Add your first account** | Empty net worth with no guidance | Points to first action without restating the whole Accounts empty state |

---

## 6. Business scenarios

**Pattern**  
Flow-specific wording that expresses core concepts in context.

**When**  
A product flow uses scenario language that differs from the core terminology concept.

**Rules**
- Map scenario copy to core record and action concepts without creating new terminology
- Credit card activity uses scenario labels (purchase, payment) while records map to core types in the engine
- Authentication flows use scenario phrasing (e.g. Create your account) without defining a separate account concept
- Use scenario-specific commit labels when the object clarifies the action (e.g. Save purchase, Save payment)
- Do not introduce scenario names as product terminology concepts

### Examples

| Scenario | Good | Avoid | Notes |
|---|---|---|---|
| Registration screen title | **Create your account** | Registration, Sign up | Scenario phrasing — Terminology: Registration |
| Credit card activity menu | **Add purchase** · **Add payment** | Add expense · Add transfer | Scenario labels on credit product |
| Purchase success toast | **Purchase recorded** | Credit card expense saved | Scenario outcome — engine uses expense record type |
| Payment success toast | **Payment recorded** | Transfer completed | Payment scenario — engine uses transfer |
| Record type picker on current account | **Income** · **Expense** · **Transfer** · **Adjustment** | Purchase · Payment on generic account | Scenarios only on credit flows |
| Auth login footer link | **Create account** | Register | Short action link — not the Registration concept noun |
| Certificate interest field helper | *Where should certificate interest be paid?* | *Select interest payout destination account* | Natural question — field label stays **Interest destination** |

---

## 7. Transient states

**Pattern**  
Copy for temporary system and connectivity states.

Progressive action labels belong to Action labels; this section covers non-control loading, connectivity, and transient system states.

**When**  
The interface is loading, offline, syncing, or offering recovery after failure.

**Rules**
- **Loading** — prefer non-verbal or minimal indicators; avoid full sentences when a control already shows progress
- **Offline / online** — state connectivity status briefly; do not explain features at length
- **Recovery** — use the approved recovery surface label for the control (e.g. Try again); Recovery is a concept, the label is a pattern
- Do not treat transient states as product terminology concepts
- Apply Tone adaptation only when a state requires more context than the baseline voice

### Examples

| Scenario | Good | Avoid | Notes |
|---|---|---|---|
| Offline banner | Title: **You're offline** · Description: *Some features may not be available* | *You are currently offline. NUME requires an internet connection to sync your accounts and records.* | Brief status — no feature tour |
| Back online toast | **You're back online.** | *Connection restored. Syncing your data now.* | One sentence unless sync failure needs detail |
| Session expired | **Your session has expired. Please sign in again.** | *For your security, you have been logged out.* | States fact + next step |
| Failed data load control | **Try again** | Recovery, Reload, Refresh | Surface label for Recovery concept — no Arabic/English concept noun in UI |
| Auth submit in progress | **Signing in…** on the button | *Please wait while we sign you in* | Progressive label on control — see Action labels |
| Full-screen bootstrap | Splash animation (no sentence) | *Loading your financial data…* | Prefer non-verbal when no user action is available |

---

## Status

Structure and examples locked. Editorial refinement happens during Content Matrix review, not by expanding this document unless a genuine pattern gap appears.
