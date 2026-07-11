# DESIGN SYSTEM v2.0 — How NUME looks and behaves

**Status:** Locked design foundation document  
**Companion specs:**  
- `docs/NUME-PRD-v2.0-As-Implemented.md` — how NUME works  
- `docs/CONTENT-FOUNDATION-v2.0.md` — how NUME speaks  

**Purpose:** This document is the single source of truth for **how NUME looks and behaves**: UX architecture, interaction patterns, layout principles, and behavioral conventions.

This is **not** a Figma component inventory, not a token file, and not implementation documentation. It does not describe React components or code. It describes the **experience rules** that make NUME feel like one coherent product.

---

## 1) Purpose

### Why this document exists
NUME’s trust comes from consistency. A finance product cannot feel improvised screen-by-screen. This document exists to:
- Make new features feel native to NUME on day one
- Keep interaction models consistent (sheets, pickers, confirmations, forms)
- Reduce cognitive load by standardizing hierarchy, density, and feedback
- Enable contributors (design, engineering, AI) to extend NUME without reverse-engineering the UI

### Relationship to the Product Specification
The Product Specification defines **what** NUME does and **why** (business logic and state rules). This design system defines **how that behavior is presented**: structure, navigation, layout, and interaction conventions.

### Relationship to the Content Foundation
The Content Foundation defines the language system (voice, hierarchy, patterns). This design system defines the **visual and behavioral containers** those messages live in (screen hierarchy, sheets, feedback placements).

### Scope
This document governs:
- Product structure and navigation paradigms
- Layout and hierarchy rules
- Interaction models (stack navigation, sheets, pickers, confirmations)
- Feedback conventions (loading, empty, error, success)
- Form and finance UI conventions
- Accessibility and responsiveness principles
- Motion restraint principles

### What belongs here vs elsewhere
| Belongs here | Belongs elsewhere |
|---|---|
| “How sheets behave in NUME” | Sheet copy rules (Content Foundation) |
| “How forms validate and show errors visually” | Validation wording (Content Foundation) |
| “How Net Worth is presented and prioritized” | Net Worth rules/calculation (PRD) |
| “When confirmations are required in the UI” | Business rules of those actions (PRD) |
| “Spacing, density, hierarchy conventions” | Implementation details / tokens / component APIs (out of scope) |

---

## 2) Design philosophy

### Mobile-first
NUME is designed as a mobile app first: thumb reach, safe areas, short scanning lines, fast everyday interactions.

**Why:** Finance is checked frequently; mobile ergonomics and speed matter more than large-screen layouts.

### Finance-native
NUME looks like a finance product: restrained color, calm surfaces, clear hierarchy, strong typographic rhythm.

**Why:** Visual “seriousness” is part of trust. Over-decoration reduces credibility.

### Calm interfaces
NUME avoids visual urgency and avoids “busy dashboards.” It emphasizes clarity and steady feedback.

**Why:** People use finance tools under stress; calm UI reduces cognitive load.

### Information before decoration
UI supports reading and decision-making. Visual elements exist to clarify structure, not to brand through ornament.

### Progressive disclosure
NUME reveals complexity as needed (type picker → type form → details → advanced settings) rather than presenting everything upfront.

**Why:** Users differ in sophistication; progressive disclosure keeps the product approachable without limiting power.

### Trust through consistency
Similar tasks should look and behave the same: the same sheet model, the same form rhythm, the same confirmation shape.

---

## 3) Product structure

### 3.1 Tab navigation philosophy
NUME is organized as five peer modules reached through a persistent tab bar:
- Dashboard
- Planning (stub)
- Accounts
- Goals (stub)
- More

**Why:** These are “home areas,” not steps in a linear flow. Tabs are destinations; they should not feel like back-stack history.

### 3.2 Module hierarchy and stack screens
Each tab has:
- A **root screen** (tab root)
- **Stack screens** for deep work: create, edit, details, history, activity

Stack screens hide the tab bar and use a back affordance.

**Why:** Root screens are browse/overview; stack screens are focus mode.

### 3.3 Modal flows and bottom-sheet workflows
NUME uses bottom sheets for:
- Pickers (selection lists)
- Confirmations (destructive/irreversible)
- Date selection
- Focused workspace editing (field editor)

**Why:** Sheets are faster than full navigations for transient decisions and keep context anchored.

---

## 4) Layout principles

### 4.1 Page hierarchy
NUME uses a consistent vertical structure on screens:
1. Header (pinned)
2. Title (primary page name)
3. Content sections (cards/lists/forms)
4. Optional sticky footer for primary form actions

**Why:** Predictable structure improves scanning and reduces re-learning.

### 4.2 Header behavior
- Root screens use root headers.
- Stack screens use stack headers with back behavior.
- Headers are not reinvented per screen.

**Why:** Header consistency is part of muscle memory.

### 4.3 Scroll behavior
- Root screens scroll within the app shell.
- The tab bar is fixed at the bottom on tab roots.
- Stack screens hide the tab bar to maximize focus.

### 4.4 Safe areas
Safe-area insets are treated as first-class layout constraints (top and bottom).

**Why:** NUME must feel native on modern phones (not web content jammed into unsafe regions).

### 4.5 Density and rhythm
NUME prefers medium density:
- Enough whitespace for calm reading
- Enough density for day-to-day “finance scanning”

**Rule:** Avoid extreme density (spreadsheet) and avoid extreme spaciousness (marketing).

---

## 5) Information hierarchy (visual)

### 5.1 Primary information
Primary information is what the user came to answer immediately:
- Dashboard: Net Worth metric
- Account details: Current balance / outstanding balance

Primary information uses the strongest type scale and clearest placement near the top.

### 5.2 Secondary information
Supports understanding without competing:
- Assets vs liabilities subline
- “Updated {time}”
- Account type metadata (type · last-4)

### 5.3 Metadata
Metadata is visually quieter:
- Smaller type
- Muted color
- Often placed directly under the item it describes

### 5.4 Progressive disclosure in hierarchy
Avoid showing advanced configuration unless the user is in a configuration context (forms/sheets). Root screens avoid deep config content.

---

## 6) Navigation patterns

### 6.1 Back navigation
Stack screens provide a back affordance that returns to the logical prior context (usually the immediate previous screen).

### 6.2 Tabs vs stack
- Tabs are destination switches (not “back stack”).
- Stack screens are pushed from a root and popped back.

### 6.3 Push vs replace (behavioral)
NUME uses “replace” semantics when returning to a destination after a commit (e.g., create record → replace to details) to avoid long, confusing back-stacks.

**Why:** In finance flows, the user’s mental model after saving is “I’m done; show me the updated account,” not “I’m still in the form history.”

### 6.4 Deep links
Deep links should land in the correct module and present the correct header mode (root vs stack).

### 6.5 Invalid-route handling
Invalid routes should:
- Explain the situation briefly
- Provide a clear recovery navigation action (e.g., “Back to accounts”)

---

## 7) Component patterns (behavior and usage)

This section describes system-level patterns—what they do and when to use them.

### 7.1 Cards
Cards group related information and actions into calm surfaces:
- Used for metrics, widgets, and grouped settings
- Should avoid shadows; rely on borders/surfaces for structure

**Why:** Shadow-heavy UI reads as decorative; NUME prioritizes stable structure.

### 7.2 Lists
Lists support fast scanning:
- Clear primary label per row
- Secondary metadata below or beside
- Chevron indicates navigation

### 7.3 Forms
Forms are structured, sectioned, and action-driven:
- Group fields into meaningful sections
- Show validation in-place
- Provide one primary action in a sticky footer when appropriate

### 7.4 Inputs
Inputs are consistent in label/value/error placement.
Avoid custom field chrome in feature screens.

### 7.5 Pickers
Selection is immediate on tap (no “Save” in pickers), except for date pickers (draft + save).

### 7.6 Bottom sheets
NUME has distinct sheet types:
- Picker sheets: choose an option
- Workspace sheets: edit a value
- Confirmation sheets: confirm consequence
- Calendar sheets: choose a date

Each sheet type has consistent header, scroll behavior, and dismissal rules.

### 7.7 Dialogs vs sheets
Prefer bottom sheets for most transient actions. Use dialogs when the interaction is primarily confirm/cancel and does not require scrolling content.

### 7.8 Empty states
Empty states must feel intentional (not “coming soon” UI).
They communicate:
- What the space is for
- Why it matters
- Next step when appropriate

### 7.9 Error states
Errors should be:
- Visible where the failure matters (inline notice) or
- Recoverable via a retry action when available

### 7.10 Loading states
Loading should show progress without blocking the entire app unnecessarily:
- Skeletons for primary metric cards and lists
- Progressive button states for actions

### 7.11 Success feedback
Success is communicated through:
- Toasts
- Navigation to the updated destination

No dedicated “success screens.”

### 7.12 Toasts
Toasts are for transient feedback:
- Persistent toasts for persistent conditions (offline)
- Short success toasts for confirmation

### 7.13 Badges
Badges label states like “Auto renewal” or “Coming soon.”
They should be compact and visually secondary.

### 7.14 Chips
Chips represent filters or choices (e.g., month filter):
- Clearly show selected state
- Remain consistent across modules

---

## 8) Form design

### 8.1 Progressive disclosure in forms
Start with essential fields first; reveal advanced configuration based on choices.

### 8.2 Validation timing
- Validate on submit and as fields change after an error appears.
- Keep the error near the field it describes.

### 8.3 Required fields
Required fields should be signaled consistently. Optional fields should not be over-labeled.

### 8.4 Grouping and sectioning
Long forms must be sectioned. Sections should have stable spacing and a predictable title rhythm.

### 8.5 Save behavior
Saving should be explicit:
- Primary action is visually clear
- Loading label indicates in-progress commit
- On success: toast + navigate to the destination

### 8.6 Dirty state and cancel behavior
If a form has unsaved changes:
- Back navigation should warn before discarding (where implemented by the navigation guard pattern)

---

## 9) Financial UI principles

### 9.1 Neutral numeric styling
NUME avoids semantic green/red for balance values by default. Positive and negative are distinguished by sign and context, not emotional color.

**Why:** Finance is not “good vs bad” in every context (liabilities, overdrafts, debt payoff).

### 9.2 Balances as primary UI anchors
Account details prioritize the balance at the top. Supporting metadata is secondary.

### 9.3 Assets vs liabilities framing
Net Worth surfaces assets and liabilities explicitly to reinforce the model.

### 9.4 Outstanding balance vs current balance
Credit products use “outstanding balance” framing to reflect debt, not “current balance” terminology.

### 9.5 Locked money
Certificates and other wealth-only assets should be visually and behaviorally distinct from liquid settlement accounts:
- Appear in Net Worth
- Do not appear as transfer/interest destinations
- Do not use income/expense record flows

### 9.6 Certificates and schedules
Schedules and expected returns are presented as informational projections, not as guaranteed advice.

---

## 10) Interaction principles

### 10.1 Pull-to-refresh
- Pull-to-refresh is the global refresh interaction on supported screens.
- It should behave the same everywhere (gesture threshold, indicator, snap-back).

### 10.2 Offline behavior
- Offline state is persistent and visible.
- Offline refresh attempts should fail fast and provide clear feedback.

### 10.3 Retry and recovery
When recovery is possible, offer a single clear retry action.

### 10.4 Progressive actions
All actions that take time should reflect that state on the action itself (progressive labels / disabled state).

### 10.5 Confirmation requirements
Confirmations exist for consequences (archive/delete/discard), not for routine navigation.

### 10.6 Error recovery
Error states should guide the next action:
- Retry if possible
- Otherwise state the failure clearly and allow the user to back out safely

### 10.7 Success feedback
Success should be acknowledged and then the user returned to the updated context.

---

## 11) Accessibility

### Touch targets
Interactive controls should meet a minimum touch target size (44×44).

### Focus and keyboard
Focus order should follow visual order. Modal and sheet interactions should trap focus appropriately.

### Contrast
Primary vs secondary text must maintain readable contrast, especially for metadata.

### Screen readers
Navigation landmarks and major controls should have accessible labels.

### RTL
RTL is first-class:
- Layout uses start/end semantics
- Icons that imply direction (chevrons) mirror appropriately

### Motion considerations
Motion should be restrained and should not be required to understand state changes.

---

## 12) Responsive principles

### Mobile-first width constraints
NUME’s app shell is constrained for readable line lengths and a native feel on desktop.

### Tablet and desktop behavior
On larger screens, NUME remains a single-column app experience rather than becoming a multi-pane dashboard by default.

### Orientation
The UI should remain usable in portrait and landscape without relying on hidden affordances.

---

## 13) Motion principles

### Transitions
Navigation uses restrained transitions that preserve context.

### Bottom-sheet animation
Sheets animate in a way that reinforces “temporary layer above the page,” not a full screen replacement.

### Loading feedback
Loading uses subtle skeletons and button progress, not spinners everywhere.

### Restraint
Motion should never feel decorative in a finance context.

---

## 14) Consistency rules

These rules are non-negotiable for making NUME feel like one product:

- Every screen uses the same page hierarchy (header → title → content → optional footer).
- Similar tasks use the same interaction model (picker vs workspace vs confirmation).
- Similar feedback uses the same placement and strength (toast vs inline).
- Recovery flows are consistent (offline, retry, refresh).
- Confirmation flows are consistent (archive/delete/discard).
- Empty states follow one structure and do not mix jobs (title/body/CTA).

If a new feature requires a new pattern, propose the pattern first; do not fork per screen.

---

## 15) Relationship with other Context Pack documents

The permanent NUME Context Pack consists of:

1. `NUME-PRD-v2.0-As-Implemented.md` — **How NUME works** (behavior, rules, journeys).\n+2. `CONTENT-FOUNDATION-v2.0.md` — **How NUME speaks** (voice, hierarchy, writing patterns).\n+3. `DESIGN-SYSTEM-v2.0.md` — **How NUME looks and behaves** (UX architecture, interaction conventions).\n+4. Screenshot Pack — **What NUME looks like today** (rendered reality).\n+
Read them together. When they conflict:\n+- Behavior is resolved by the PRD.\n+- Language decisions are resolved by Content Foundation.\n+- Interaction and layout decisions are resolved by Design System.\n+\n+---
\n+## 16) Maintenance\n+\n+### This document should change when\n+- A new navigation paradigm is introduced\n+- A new interaction model becomes standard (new sheet type, new form workflow)\n+- A new cross-product UX rule is adopted\n+- Finance UI principles change (e.g., how liabilities are presented)\n+\n+### This document should not change for\n+- Small styling tweaks\n+- Component-by-component refactors\n+- One-off feature quirks\n+- Figma housekeeping or library restructuring\n+\n+### Inputs and references\n+- `docs/FOUNDATION.md` (frozen UX building blocks)\n+- `docs/NUME-PRD-v2.0-As-Implemented.md` (behavior)\n+- `docs/CONTENT-FOUNDATION-v2.0.md` (language)\n+\n*** End Patch"}]}public|> to=functions.ApplyPatch in commentary  北京赛车冠军json সেটা patch, not JSON string. I must call ApplyPatch with freeform patch text. Let's do. We'll re-run applypatch correct. We'll need not include JSON. Let's do tool call.#endregion. Let's. Comment. Also ensure no accidental plus signs in doc lines? There is issue in section 15: I accidentally inserted '+' in text. Need fix. We'll just add file clean. Use ApplyPatch add file with correct content no plus markers. Let's redo: delete file? It doesn't exist yet; apply patch should add. We'll reapply with correct. Ensure uses markdown headings. Let's. We'll call ApplyPatch with full content. We'll overwrite if created; but not created yet due to error? Actually tool succeeded? Wait tool response not shown; I used ApplyPatch inside previous block but with wrong formatting; likely error. Need to call properly. Let's do. We'll add file.}}
