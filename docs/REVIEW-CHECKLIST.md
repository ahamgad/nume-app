# NUME Review Checklist

How to verify that content is ready to ship against the Foundation.

## Overview

### Purpose

> **This document defines how to verify that content is ready to ship against the Foundation.**
>
> **It governs validation before release — not how to write copy or how to make unresolved decisions.**

**Question it answers:** Does this copy meet the Foundation before it ships?

**What it does not answer:**
- How to write copy → Voice & Tone · Writing Patterns
- How to decide when guidance is unclear → Decision Framework
- Which document wins when two conflict → [Decision precedence](CONTENT-DESIGN-FOUNDATION.md#decision-precedence)

### Scope

**Owns:** review process · change classification · Foundation verification · ship outcomes

**Does not own:** writing rules · concept definitions · communication behavior · interface patterns · decision process · language-specific review · navigation structure

The Review Checklist validates Foundation compliance. Content Matrix review validates product coverage and editorial completeness.

### Relationship to Foundation documents

| Document | Role in review |
|---|---|
| Content Principles | Verify writing priorities |
| Product Terminology | Verify approved concepts |
| Voice & Tone | Verify communication behavior |
| Writing Patterns | Verify interface expression |
| Decision Framework | Verify decision process when required |
| Review Checklist | Gate before shipping |
| Localization Guidelines | Verify language-specific adaptation *(future)* |

When verification fails because guidance is incomplete or unresolved, escalate through the Decision Framework — do not ship on assumption.

### When to run this checklist

Run this checklist before shipping any new or revised user-facing copy.

---

## 1. Review process

**Situation**  
Any content change proposed for release.

**Process**

1. **Identify the change** — what copy is new or revised, and where it appears.
2. **Classify the change** — determine routing in Section 3.
3. **Run Foundation verification** — complete applicable checks in Section 2.
4. **Record the outcome** — note which checks passed, failed, or were not applicable.
5. **Decide:**
   - **Ship** — all required checks pass
   - **Revise** — Foundation guidance exists but copy does not comply
   - **Escalate** — the Foundation cannot fully resolve the case; use the Decision Framework

**Rules**
- Do not ship while a required check is failing
- Do not revise without identifying which Foundation rule the copy violates
- Do not escalate when guidance exists and copy can be revised to comply
- Escalate and Ship are mutually exclusive outcomes

**Outcomes**  
Ship · Revise · Escalate

---

## 2. Foundation verification

Apply verification in Decision Precedence order. Only run checks that are applicable to the current change.

Complete the subsections that apply per change classification. Each subsection uses the same structure.

### Content Principles

**Applies when**  
Any new or revised user-facing copy.

**Verify**
- Is the copy immediately understandable?
- Does the copy add understanding, not noise?
- Does the copy avoid repeating what the interface already communicates?
- If clarity is unchanged, is the copy left unchanged?

**Fail action**  
Revise to comply with Content Principles.

---

### Product Terminology

**Applies when**  
Copy references a product concept, entity, action, or domain term.

**Verify**
- Does the copy use approved product terms?
- Does the copy avoid synonyms for defined concepts?
- Does the copy avoid reusing a term for a different concept?
- If a new concept is required, was it approved in Terminology before shipping?

**Fail action**  
Revise to use approved terms, or Escalate to propose a Terminology update.

---

### Voice & Tone

**Applies when**  
Any new or revised user-facing copy.

**Verify**
- Does the copy match baseline Voice (directness, context, guidance, precision)?
- Does the copy match the applicable Tone adaptation situation, if any?
- Does the copy avoid emotion-driven wording where behavior-driven wording is required?

**Fail action**  
Revise to comply with Voice & Tone.

---

### Writing Patterns

**Applies when**  
Copy appears in the interface — labels, helpers, messages, confirmations, empty states, scenarios, or transient states.

**Verify**
- Does the copy follow the relevant Writing Pattern for this UI element?
- Does the copy follow global contextual wording rules?
- Does the copy use scenario phrasing only where Business scenarios applies?
- If no pattern exists, was the Decision Framework used?

**Fail action**  
Revise to comply with Writing Patterns, or Escalate if no pattern exists.

---

### Decision Framework

**Applies when**  
Guidance was incomplete, combined, novel, or required a Foundation update decision.

**Verify**
- Was the Decision Framework followed?
- Was product validation completed when required?
- Is the decision classified correctly as one-off copy or Foundation update?
- If a Foundation update is required, was it approved before wide application?

**Fail action**  
Escalate — complete or repeat the Decision Framework process.

---

### Localization Guidelines *(active)*

**Applies when**  
Copy is added or revised in English or Arabic.

**Verify**
- Does Arabic copy follow Localization Guidelines?
- Does English copy follow Localization Guidelines?
- Are English and Arabic synchronized per Terminology and Section 4?

**Fail action**  
Revise per Localization Guidelines, or Escalate.

---

## 3. Change classification

**Situation**  
After identifying the change, before running verification.

**Process**

Determine for each change:

1. **Which verification subsections apply**
2. **Which additional checks are required**
3. **Whether escalation is expected before review completes**

| Change type | Verification focus | Additional checks | Escalation expected |
|---|---|---|---|
| **New copy** | All applicable Foundation subsections | Terminology entry exists or Decision Framework was used; Writing Pattern exists or Framework was used | Yes — when no term or pattern exists |
| **Revised copy** | All applicable Foundation subsections | Change is required by Foundation — not preference-only | Only when revision reveals a Foundation gap |
| **New feature** | All applicable Foundation subsections | Terminology and patterns approved for new concepts and surfaces | Yes — when feature introduces new concepts |
| **One-off exception** | Content Principles · Voice & Tone · applicable Writing Patterns | Exception is documented and bounded | Yes — if exception would set precedent without Foundation update |

**Rules**
- Classification determines routing — it does not replace verification
- When escalation is expected, run Decision Framework before Ship
- Do not classify as one-off to avoid a Foundation update when the case will recur

**Outcomes**  
A verification plan: which subsections to run and whether Escalate is likely

---

## 4. Ship criteria

**Situation**  
After Foundation verification is complete.

Three mutually exclusive outcomes.

Exactly one outcome must be selected:

- **Ship**
- **Revise**
- **Escalate**

### Ship

All required verification subsections pass.  
Any one-off exception is documented and bounded.  
No unresolved Foundation gap blocks release.

### Revise

Foundation guidance exists and applies.  
Copy does not comply with one or more verification checks.  
Return to revision — do not Escalate unless revision reveals a Foundation gap.

### Escalate

The Foundation cannot fully resolve the case.  
Use the Decision Framework before shipping wide copy changes.  
Do not Ship until the framework produces a decision or approved Foundation update.

**Rules**
- Exactly one outcome applies per review
- Revise and Escalate can follow each other — Revise first when guidance exists
- Ship requires all applicable checks to pass

---

## 5. Content Matrix module review

How to review product copy module by module against the Foundation.

This is the operational workflow for Content Matrix review. It extends Section 1 with module-specific discipline.

### Module preparation

Before reviewing a module, build a **complete inventory** of every user-facing surface that belongs to it. Present the inventory for approval **before any copy review begins**.

Build the inventory from the **implementation** — routes, components, i18n keys, sheets, dialogs, and runtime messages — not from translation files alone.

Include, where applicable:

- Screens
- Detail screens
- Create and edit flows
- Bottom sheets
- Dialogs
- Drawers
- Menus
- Empty states
- Loading states
- Success states
- Error states
- Validation states
- Toasts
- Inline helper text
- Inline system messages

**Rules**

- Every surface in the inventory must map to a concrete location (file, route, or component).
- Every **reviewable** surface must include a **Review status** column (see below).
- The inventory is the review checklist for that module. Do not begin classification until it is approved.
- If a surface is discovered after approval, the inventory was incomplete — update it and treat the module as not yet complete.

### Product maturity

Classify every module at the top of its inventory:

| Value | Meaning |
|---|---|
| **Stub** | Placeholder module — evaluate only surfaces that exist today; missing future functionality must not become Missing copy or Foundation gaps |
| **Partial** | Core flows exist but the module journey is incomplete |
| **Complete** | Full module journey implemented |

### Review groups

For feature modules, organize surfaces into **logical review groups** before listing individual IDs. Group names should reflect user journeys (e.g. list, details, create, edit, sheets, pickers, confirmations, empty states, loading, errors, success).

- Each group contains its inventoried surfaces with IDs
- Classification still happens **per surface**, not per group
- Groups make large inventories easier to review and maintain as the module grows
- Small or stub modules may use fewer groups when the journey is simple

### Review status

Allowed values for every **reviewable** surface. By module completion, each reviewable surface must have exactly one final status:

| Status | Meaning |
|---|---|
| **Not reviewed** | Default before copy review begins |
| **Keep** | Foundation-compliant |
| **Revise** | Change measurably improves compliance — implement in this module |
| **Missing** | New governed copy required |
| **Implementation gap** | Governed copy exists but is not wired or surfaced |
| **Foundation gap** | Cannot be resolved with current Foundation |
| **Deferred** | Valid improvement outside this module's scope |

Non-reviewable surfaces (user content, formatted values, non-verbal UI) do not receive a review status.

The inventory is the single source of truth for preparation, review progress, and final outcome. No separate tracking document.

### Scope per module

Review the **entire user journey** for the module — not only the landing screen.

The approved inventory must cover every surface that belongs to the module, including nested or secondary screens reachable from it. No surface in scope may be omitted from the inventory.

### Source coverage

Review the **implementation**, not only translation files.

Validate every user-facing string regardless of origin:

- i18n keys (`en.ts`, `ar.ts`)
- Inline strings in components
- Runtime-generated text
- API and provider errors surfaced in UI
- Dialogs, bottom sheets, and confirmation copy

### Validation order

For each string, validate against the Foundation in [Decision precedence](CONTENT-DESIGN-FOUNDATION.md#decision-precedence) order:

1. Content Principles
2. Product Terminology
3. Voice & Tone
4. Writing Patterns

Note Localization Guidelines when language mechanics apply.

### Classification

Every surface in the approved inventory must receive exactly one classification:

| Class | When to use |
|---|---|
| **Keep** | Already Foundation-compliant |
| **Revise** | Change measurably improves Foundation compliance |
| **Missing** | New governed copy is required and does not exist yet |
| **Implementation gap** | Governed copy exists but is not wired, mapped, or surfaced correctly |
| **Deferred** | Improvement is valid but intentionally outside this review's scope (editorial cleanup, future Foundation work, planned global migrations) |
| **Foundation gap** | Cannot be resolved using the current Foundation (rare — escalate) |

**Rules**

- Do not propose revisions when current copy already complies. Different wording alone is not a valid reason for change.
- Use **Revise** only for changes that should be made in the current module review. Route everything else to **Deferred**.
- Split **Missing** (copy does not exist) from **Implementation gap** (copy exists but is not wired).
- Use **Deferred** for punctuation-only refinements, cross-module editorial consistency, and other improvements that do not require action before the module ships. Record the target pass (e.g. editorial cleanup).
- Finish each module in one comprehensive review. Do not defer surfaces that belong to the module — only defer *changes* that are out of scope.

**Recovery action labels**

Navigation and recovery CTAs must describe the destination or action — not reuse a screen title.

| Good | Avoid |
|---|---|
| Back to accounts | Accounts |
| Back to sign in | Sign in |

**Pattern propagation**

When a review identifies a copy or wiring pattern, search the **entire module** for every occurrence during that group's review. Fix or classify all instances in the group scope; note cross-group occurrences in the inventory for the group that owns them.

**Shared copy**

If multiple surfaces render the same i18n key, generated string, or shared component, review the wording **once at its source**. Do not re-review identical copy for every surface.

- Review the shared source
- List every affected surface in the group
- Propagate the classification automatically
- Review a surface separately only when it adds contextual wording or changes the message

The inventory still lists every surface. Record whether each decision is **source-level** or **surface-specific**.

**Review priority**

After inventory and shared-source analysis, review effort should be proportional to the likelihood of Foundation issues. Prioritize in this order:

1. **Unique copy** owned by the current group
2. **Shared sources** not reviewed previously
3. **Shared sources** previously classified as Revise or Deferred
4. **Previously approved shared sources** used unchanged in this group

For category 4, do not perform a full wording review again. Verify the source has not changed, verify context does not alter meaning, and propagate the previous classification. Reopen wording review only if the source changed, surrounding context changes meaning, or a different Foundation document now applies.

**Source ownership**

When a shared source is first reviewed, it becomes the authoritative review point for that source. Record on the shared source:

- Current classification
- Foundation rationale
- Implemented changes (if any)
- Affected surfaces

Later groups reference that record instead of repeating reasoning. Reopen only if the source changed, context changes meaning, or a different Foundation rule applies — then update the existing source record, do not create a second one.

See the module inventory **Shared source registry** for the running record during Accounts review.

### Revision format

For every **Revise**, **Missing**, or **Implementation gap**, record:

- Current copy (or gap description)
- Proposed copy or fix
- **Foundation rationale** — name the governing document and rule (e.g. Writing Patterns §5 empty states; Voice & Tone — Precision; Product Terminology — Net worth; Content Principles §1 Clarity)
- Impact: Clarity · Terminology · Voice · Pattern · Localization

For every **Deferred** item, record:

- Current copy (if applicable)
- What would change (brief)
- Why it is deferred and which pass owns it (e.g. editorial cleanup)

### Module completion

A module review is complete only when **every surface in the approved inventory** has been reviewed and classified. No follow-up discovery passes should be necessary.

A module is complete when:

- The surface inventory was approved before review began
- Every surface in the inventory has been reviewed and classified
- Approved **Revise**, **Missing**, and **Implementation gap** items are implemented or explicitly queued for this module
- **Deferred** items are recorded with their target pass
- No unresolved **Foundation gap** items remain without escalation

### Module completion record

At the end of every module review, add a short **completion summary** to that module's inventory file. The goal is to make each module self-contained and auditable without reading the entire inventory.

Use this structure:

| Field | Content |
|---|---|
| **Module** | Module name |
| **Product maturity** | Stub · Partial · Complete |
| **Review date** | Date review was approved |
| **Inventory version** | Version number (increment when inventory changes after approval) |
| **Final counts** | Keep · Revise · Missing · Implementation gap · Deferred · Foundation gap |
| **Deferred items** | IDs and target pass |
| **Foundation changes introduced** | None, or what was added and why |
| **Build / test status** | Result at completion |

The completion summary is written after implementation. It does not replace per-surface review statuses in the inventory tables.

---

## Status

Structure locked. Module review workflow locked — preparation, inventory, classification, implementation, completion record. Editorial cleanup pass follows full product review.
