# NUME Decision Framework

How to make content decisions when the Foundation does not provide a complete answer on its own.

## Overview

### Purpose

> **This document defines how to make content decisions when the Foundation does not provide a complete answer on its own.**
>
> **It governs the decision process — not the rules inside other Foundation documents.**

**Question it answers:** How do we decide what to do when guidance is incomplete, combined, or missing?

**What it does not answer:** Which document wins when two conflict — see [Decision precedence](CONTENT-DESIGN-FOUNDATION.md#decision-precedence).

### Scope

**Owns:** decision process · applying multiple Foundation documents · novel cases · criteria for Foundation updates

**Does not own:** writing priorities (Content Principles) · product concepts (Product Terminology) · communication behavior (Voice & Tone) · interface expression (Writing Patterns) · precedence order · validation gates (Review Checklist) · language-specific rules (Localization Guidelines) · navigation structure (Navigation & IA)

### Relationship to Foundation documents

| Document | Role in decisions |
|---|---|
| Content Principles | Highest-priority writing constraints |
| Product Terminology | Approved product concepts |
| Voice & Tone | Communication behavior and situational tone |
| Writing Patterns | How concepts and voice appear in the interface |
| Decision Framework | How to decide when the above are not sufficient |
| Review Checklist | Verify decisions before shipping |
| Localization Guidelines | Language-specific adaptation |

When documents **conflict**, apply Decision precedence. When they do not conflict but the answer is still unclear, use this framework.

### When to use this framework

Use this framework when:

- No single Foundation document fully resolves the case
- Multiple Foundation documents apply and must be combined
- The case falls outside current Foundation scope
- It is unclear whether the decision is one-off copy or requires a Foundation change

Do not use this framework when documents clearly conflict — apply Decision precedence directly.

---

## 1. Decision process

**Situation**  
Any content decision that requires more than reading one rule from one document.

**Process**

1. **Identify the decision** — what copy or concept choice is required, and where it appears.
2. **List applicable documents** — which Foundation documents bear on this case.
3. **Check for conflict** — if documents conflict, stop and apply Decision precedence.
4. **Apply relevant guidance** — use applicable documents in precedence order as inputs, not as competing rules.
5. **Validate with product** — when the decision depends on how NUME works or product intent is unclear.
6. **Classify the outcome** — one-off content decision, or escalation to a Foundation update.
7. **Record the reasoning** — note which documents informed the decision and why.

**Rules**
- Do not invent terminology, voice traits, or patterns not in the Foundation
- Do not assume product behavior when context matters — validate first
- Do not use global find-and-replace logic to resolve decisions
- Do not restate Foundation rules as substitutes for deciding the specific case

**Outcomes**
- A specific copy decision ready for Review Checklist, or
- A documented proposal to update a Foundation document

---

## 2. Applying multiple Foundation documents

**Situation**  
The Foundation applies but does not produce an immediate answer — whether because multiple documents combine or because existing guidance is incomplete.

**Process**

1. Follow the Decision process through step 4.
2. **Combine guidance** — apply each applicable document within its ownership:
   - Terminology names the concept
   - Voice shapes how much to say and how directly
   - Writing Patterns express the result in the interface
   - Content Principles resolve priority when trade-offs appear within owned scope
3. **Fill gaps deliberately** — when a document is silent, infer from the nearest owned guidance rather than from preference or implementation defaults.
4. **Validate with product** — when combination still leaves ambiguity, or when the decision depends on product behavior not defined in the Foundation.
5. **Classify the outcome** — if the gap is recurring or systemic, escalate to Foundation updates instead of deciding copy alone.

**Rules**
- Combining documents is not the same as merging their ownership
- Silence in one document does not override guidance in another
- Implementation informs discussion but does not determine terminology or voice decisions
- Context determines wording — do not harmonize without checking whether difference is intentional
- Prefer leaving copy unchanged when Foundation guidance does not require a change

**Outcomes**
- A content decision that composes existing Foundation guidance, or
- Escalation when the gap repeats or affects multiple surfaces

---

## 3. Novel decisions

**Situation**  
The case falls outside current Foundation scope — no terminology entry, no pattern, no applicable tone situation, or a new product capability.

**Process**

1. Follow the Decision process through step 3.
2. **Confirm the gap** — verify the case is not already covered by an existing concept, pattern, or situation under a different name.
3. **Apply the nearest owned guidance** — use the closest terminology, voice behavior, and pattern as a provisional model.
4. **Validate with product** — confirm product intent, scope, and whether the case will recur.
5. **Classify the outcome** — provisional copy for a one-off case, or escalation to Foundation updates for recurring cases.

**Rules**
- Do not create de facto terminology, patterns, or principles through copy alone
- Do not block shipping solely because the Foundation lacks an entry — use provisional guidance and escalate if systemic
- Do not generalize from a single screen without product confirmation
- Novel cases defer to Foundation updates when they will affect multiple future decisions

**Outcomes**
- Provisional copy bounded by nearest Foundation guidance, or
- A Foundation update proposal before wide application

---

## 4. Foundation updates

**Situation**  
A decision should change the Foundation itself rather than only the copy in one place.

**Process**

1. **Confirm recurrence** — the case will affect multiple screens, future features, AI-generated copy, or localization.
2. **Identify the owning document** — where the new or revised guidance belongs:
   - New or revised concept → Product Terminology
   - New communication behavior → Voice & Tone
   - New interface expression → Writing Patterns
   - New writing priority → Content Principles
   - New navigation label → Navigation & IA
   - Language-specific convention → Localization Guidelines
3. **Propose the change** — draft the addition without applying it across the product until approved.
4. **Do not ship wide copy changes** that depend on the proposed Foundation change until it is approved.

**Rules**
- One concept, one term — do not add synonyms through copy when Terminology should decide
- Do not add principles to avoid deciding a specific case
- Do not duplicate existing guidance in a new document
- One-off exceptions stay in copy or Writing Patterns examples — not in Terminology or Principles
- Foundation updates require explicit approval before they govern new work

**Outcomes**
- A proposed change to the authoritative Foundation document, or
- Confirmation that the case remains a documented one-off exception

---

## Status

Structure locked. Examples and editorial refinement to follow.
