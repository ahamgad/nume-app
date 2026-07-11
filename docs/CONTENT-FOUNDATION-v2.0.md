# CONTENT FOUNDATION v2.0 — How NUME speaks

**Status:** Locked foundation document  
**Companion spec:** `docs/NUME-PRD-v2.0-As-Implemented.md` (how NUME works)  
**Purpose:** This document is the single source of truth for **how NUME speaks**—how copy decisions are made and how NUME’s language stays consistent as the product evolves.

This is **not** a PRD, not a content inventory, not a string catalog, and not historical review notes.

---

## 1) Purpose

### Why this document exists
NUME’s product quality depends on language as much as UI. This foundation exists so NUME:
- Reads like a mature financial product, not a prototype
- Communicates clearly under uncertainty (offline, failure, missing configuration)
- Stays consistent across modules as features expand
- Can be extended by new contributors without rediscovering decisions

### Relationship to the Product Specification
- **Product behavior** (what happens, rules, calculations, states) lives in `NUME-PRD-v2.0-As-Implemented.md`.
- **UX writing decisions** (how we name, phrase, confirm, validate, and guide) live here.

Read both together. The PRD answers “what and why the product does”; this foundation answers “how the product communicates it.”

### Scope
This foundation governs:
- Voice, tone, and writing philosophy
- Information hierarchy (title/body/CTA roles)
- Patterns for labels, empty states, errors, validation, success, confirmations, toasts, and loading
- Editorial rules (sentence case, punctuation, progressive labels)
- Cross-product consistency rules (archive/delete/restore/discard/retry, load/refresh, offline)
- Review methodology and classification

### What belongs here vs what belongs in the PRD
| Belongs here | Belongs in the PRD |
|---|---|
| How NUME phrases an error | What the error means and what the system did |
| Confirmation pattern and wording rules | Which actions require confirmation and what they do |
| Validation phrasing style | Validation rules and constraints (what’s required, ranges, formats) |
| Empty-state structure and roles | Which states exist and when they appear |
| Consistency rules across modules | Cross-module behavior and dependencies |

---

## 2) Writing philosophy

NUME’s writing exists to reduce financial uncertainty. The philosophy below explains **why** the product speaks the way it does.

### Finance-native language
NUME should sound like a financial product:
- Uses financially literate vocabulary
- Avoids trendy tech phrasing (“connect your money”, “level up”, “crush goals”)
- Prefers concrete financial concepts (balance, net worth, income, expense) over metaphors

**Why:** Users judge trustworthiness quickly. Finance-native language signals credibility and reduces cognitive friction.

### Clarity over cleverness
NUME favors direct, legible copy over originality:
- Short when possible, but never at the cost of understanding
- Explains outcomes, not UI mechanics
- Avoids cute headings or marketing lines in core workflows

**Why:** NUME is not content consumption; it’s operational decision support.

### Calm operational tone
NUME is confident, steady, and non-alarming:
- No panic language (“urgent”, “ASAP”)
- No emotional manipulation (“you’re doing great!”) in core finance flows
- No apologies in errors; focus on recovery

**Why:** Financial apps are used under stress. Calmness increases perceived control.

### Helpful without being verbose
NUME explains only what the user needs for the moment:
- One primary message per surface
- Minimal supporting detail
- No UI walkthrough text (“tap the button above…”)

**Why:** Verbosity reduces scanning and makes routine actions feel heavy.

### Confidence without marketing language
NUME communicates capability without hype:
- No “with confidence”, “in minutes”, “effortlessly” unless it is literally true and necessary
- Avoids aspirational claims for stub or future functionality

**Why:** Overpromising erodes trust faster than under-explaining.

---

## 3) Product voice

### Voice characteristics
NUME’s voice is:
- **Direct**: states the thing that matters first
- **Professional**: sounds credible in a finance context
- **Calm**: steady in error and confirmation states
- **Human**: readable and natural without slang
- **Neutral**: avoids moral judgment or motivational coaching
- **Financially literate**: uses correct concepts and distinctions (archive vs delete; balance vs outstanding balance)

### What NUME is not
- Not playful for critical actions
- Not motivational for core finance workflows
- Not “startup-speak”
- Not verbose onboarding copy in routine states

### Examples (good vs bad)
| Scenario | Good (NUME) | Bad |
|---|---|---|
| Net worth failure | “Couldn’t load net worth” | “Oops! Something went wrong 😅” |
| Required field | “Enter an amount” | “Amount is required” *(legalistic)* |
| Confirmation | “Archive this account?” + consequence | “Are you sure?” *(generic)* |
| Offline | “You’re offline” | “No internet detected. Please check your Wi‑Fi settings and try again.” |

---

## 4) Information hierarchy (communication layers)

NUME copy uses layered communication. Each layer has a different job.

### Layer roles
#### Title
Answers:
- **What is this place?**
- **What kind of workspace have I entered?**

Role: introduce the workspace from the **user’s perspective** and reinforce the correct mental model.

#### Body
Answers:
- **Why does this workspace matter?**
- **What will I be able to do here?**

Role: explain value and capability at the right level of specificity.

#### CTA
Answers:
- **What should I do next?**

Role: one clear action when action is appropriate. Not a summary and not a second body paragraph.

### Layer independence rule
Each layer must be independently useful:
- If the **body** disappeared, the **title** still creates the correct mental model.
- If the **title** disappeared, the **body** still explains value.
- If the **CTA** disappeared, the user still understands the feature.

### Title anti-patterns
- Marketing headlines (“Know what’s left each month”)
- Overpromising stub capability (“Build your perfect plan”)
- CTA language in the title (“Track progress toward…”, “Start planning”)
- Vague labels that add no mental model (“Your finances”)

### Body anti-patterns
- UI walkthrough (“Tap Add above to…”)
- Generic benefits without concrete outcome (“…so you can make better decisions”)
- Two unrelated messages in one paragraph

### CTA anti-patterns
- Explaining value (“Start with your first account to begin building a complete financial picture…”)
- Two actions (“Add account or import transactions”)
- Non-committal labels (“OK”, “Got it”) when an action is required

---

## 5) Writing principles by surface type

This section describes *how to write* each common surface type and *why*.

### 5.1 Labels (navigation, headings, row labels)
**How:** short, concrete nouns or verb phrases that match the user’s task. Use object names only when needed for clarity.  
**Why:** labels are scanning anchors; extra words reduce speed.

### 5.2 CTAs (buttons / primary actions)
**How:** use the correct action concept (Add/Create/Save/Continue/Retry). Prefer object names when the action target is ambiguous.  
**Why:** CTAs are commitments; mislabeling breaks trust.

**Progressive labels:** loading state uses the progressive form of the same verb (Signing in…, Creating account…, Saving…).  
**Why:** reduces ambiguity about what is happening now.

### 5.3 Empty states
**How:** follow the three layers:
- Title introduces the workspace
- Body explains value/capability (concrete outcome)
- CTA provides the next step only when needed

**Why:** empty states are where users decide whether a feature is useful. Clear mental model first, value second, action third.

### 5.4 Errors
**How:**
- Lead with **what failed**.
- Offer one recovery action when possible.
- Use consistent verbs across the product:
  - **Couldn’t load…** → data didn’t load
  - **Couldn’t refresh.** → user-initiated refresh failed

**Why:** users need fast diagnosis and recovery, not explanation.

### 5.5 Validation
**How:** imperative and specific:
- “Enter …” for typed fields
- “Select …” for pickers
- Mention the rule only when it isn’t obvious (e.g., “Enter exactly 4 digits”)

**Why:** validation is instruction, not a legal statement.

### 5.6 Success messages
**How:** one sentence stating what completed (“Account created”, “Payment recorded”). Avoid celebration.  
**Why:** success is confirmation; over-celebration reduces professionalism.

### 5.7 Confirmation dialogs / sheets
**How:**
- Title names the action and object (“Archive this account?”)
- Description states consequences (records preserved vs removed)
- Confirm label matches action pattern (may include object name)
- Cancel is “Cancel” unless ambiguous (then use an intent-specific dismiss)

**Why:** confirmations exist for consequence clarity, not ceremony.

### 5.8 Bottom sheets (pickers, action sheets, workspace editors)
**How:** keep titles functional (“Select date”, “Add record”, “Account type”). Avoid narrative copy.  
**Why:** sheets are transient operational UI; users want decisions, not reading.

### 5.9 Toasts
**How:** short, factual, and calm. Use persistent toasts for states like offline; short duration for success notices.  
**Why:** toasts should not compete with the primary task.

---

## 6) Product terminology (how terms are chosen)

Terminology is a design tool for recognition and trust.

### Recognition before brevity
Prefer the term users already know in finance contexts over a shorter but unfamiliar alternative.

### Full terms vs shortened terms
- Use the **full approved term** when recognition matters.
- Shortening is allowed only when:
  1) the Foundation explicitly permits it, and  
  2) the UI remains equally clear and scannable in context.

### Consistency rules
- The same concept should not be renamed across surfaces without a documented reason.
- If different phrasing is necessary, it must be a documented pattern variant (not ad hoc drift).

### Finance-native vocabulary
Use finance vocabulary precisely:
- Archive ≠ Delete
- Balance ≠ Outstanding balance
- Net worth ≠ available/goal-fundable wealth

**Reference terms:** `docs/PRODUCT-TERMINOLOGY.md` (do not duplicate the term list here).

---

## 7) Editorial rules (global)

These rules keep NUME readable and consistent.

### Sentence case
Use sentence case across titles, labels, helpers, and messages.  
**Why:** reduces visual noise and matches modern mobile finance UI.

### Trailing periods
Single-sentence helpers and field hints do **not** end with a period.  
Multi-sentence copy uses normal punctuation.  
**Why:** periods add weight and make UI feel verbose.

### Numbers, currency, and dates
Use shared formatters and locale behavior. Do not encode formatting decisions into strings.  
**Why:** ensures consistency across EN/AR and across surfaces.

### Progressive wording
Loading labels are the progressive form of the action on the same control (“Saving…”, “Creating account…”).  
**Why:** prevents ambiguous “Submitting…” states.

### Error wording
Use “Couldn’t …” patterns, not “Unable to …” and not apologetic language.  
**Why:** calm, operational, consistent.

**Reference:** `docs/CONTENT.md` and `docs/LOCALIZATION-GUIDELINES.md`.

---

## 8) Cross-product consistency (patterns)

NUME is one product. Shared intents must feel consistent everywhere.

### Destructive & lifecycle intents
Archive · Restore · Delete (permanent) · Discard

**Rule:** same intent → same pattern structure (title/description/actions), with only necessary contextual differences.

If the current Writing Pattern causes inconsistency, the correct fix is:
1) improve the Foundation pattern, then  
2) apply consistently across modules.

### Recovery intents
Retry · Refresh · Load · Offline

**Rule:** recovery language is standardized. Users shouldn’t have to learn multiple verbs for the same recovery action.

### Empty state intent
Empty state structure is consistent across modules (title/body/CTA responsibilities).

---

## 9) Review methodology

### Core review question
> **“Can this be made measurably better while remaining compliant with the Foundation?”**

### Status definitions
- **Keep:** We would intentionally write it exactly this way today.
- **Revise:** Meaningful, measurable improvement while staying Foundation-compliant.
- **Missing:** Copy is required but absent.
- **Implementation gap:** Approved copy exists but is not wired to the rendered UI.
- **Deferred:** Improvement depends on product/IA/feature work outside this pass.

### What counts as measurable improvement
- Clearer on first read
- Better recognition (terminology)
- Better scanability / hierarchy
- Better cross-product consistency
- Better terminology placement
- Better editorial quality (punctuation, casing, progressive labels)

### Evaluation order (locked)
1. **Clarity**
2. **Recognition**
3. **Scanability**
4. **Consistency**
5. **Brevity**

Brevity is never the goal by itself.

---

## 10) Relationship with the Product Specification

- `NUME-PRD-v2.0-As-Implemented.md` defines **behavior**: rules, calculations, state machines, journeys.
- `CONTENT-FOUNDATION-v2.0.md` defines **communication**: the language system that expresses that behavior.

When product behavior changes, update the PRD first. When language patterns need to change across the product, update this document.

---

## 11) Maintenance

### This document should change when
- NUME introduces a new interaction pattern that requires a new writing pattern
- A new product-wide intent appears (new lifecycle action, new recovery mode)
- A cross-product inconsistency requires a Foundation update
- Voice or tone constraints change for regulatory or trust reasons

### This document should not change for
- Individual string tweaks
- Module-by-module inventory notes
- Implementation history
- One-off copy exceptions (unless they indicate a missing pattern and should be generalized)

### References (authoritative inputs)
- `docs/PRODUCT-TERMINOLOGY.md`
- `docs/WRITING-PATTERNS.md`
- `docs/CONTENT.md`
- `docs/LOCALIZATION-GUIDELINES.md`
- `docs/DECISION-FRAMEWORK.md`
- `docs/CONTENT-DESIGN-FOUNDATION.md`

