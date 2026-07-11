# NUME Localization Guidelines

How NUME applies the Foundation in English and Arabic.

## Overview

### Purpose

> **This document defines how NUME applies the Foundation in English and Arabic.**
>
> **It governs language-specific adaptation — not what concepts mean or how the product communicates in the abstract.**

**Question it answers:** How should approved concepts and patterns be expressed naturally in each language?

### Scope

**Owns:** language parity · English conventions · Arabic conventions · cross-language Foundation application · terminology workflow · localization review

**Does not own:** approved term definitions (Product Terminology) · communication behavior (Voice & Tone) · interface patterns (Writing Patterns) · runtime i18n implementation · Content Matrix workflow · navigation structure (Navigation & IA)

Historical `docs/CONTENT.md` English editorial rules are absorbed into Section 2 unless explicitly superseded here.

Product Terminology Arabic entries remain *pending review* system-wide. Section 5 governs how that pass is completed and kept in sync.

### Relationship to Foundation documents

| Document | Localization role |
|---|---|
| Product Terminology | Source of approved English and Arabic terms |
| Voice & Tone | Behavior to preserve across languages |
| Writing Patterns | Patterns to adapt in expression, not redefine |
| Review Checklist | Localization verification references Section 6 |
| Localization Guidelines | Language-specific adaptation |

### Governing rule

> **English and Arabic are equal product languages. Neither language is the source or the translation of the other. Both implement the same Foundation decisions.**

---

## 1. Language parity

**Rule**  
English and Arabic are equal product languages.

**Implications**
- Arabic copy is not a downstream translation of English
- English copy is not the authoritative version over Arabic
- Foundation decisions apply to both languages equally
- Terminology, Voice, Tone, and Patterns must be implemented in both languages
- A change in one language requires review of the other when the same concept or surface is affected

---

## 2. English conventions

Language mechanics for English UI copy — not UX decisions.

### Editorial conventions

**Applies when**  
Writing or reviewing English user-facing copy.

**Rules**
- Use sentence case for system-generated copy
- Capitalize proper nouns, brand names, and acronyms only
- Do not change brand names, acronyms, or user-entered values
- Single-sentence helpers and field hints do not end with a period
- Multi-sentence copy uses normal punctuation

### Capitalization

**Applies when**  
Writing titles, labels, headings, and helpers in English.

**Rules**
- Capitalize the first word only, except proper nouns and acronyms
- Do not use title case for UI copy

### Punctuation

**Applies when**  
Writing English helpers, descriptions, and messages.

**Rules**
- Follow standard English punctuation in multi-sentence copy
- Do not add trailing periods to single-sentence helpers

### Numbers and dates

**Applies when**  
Formatting numbers and dates in English copy.

**Rules**
- Follow product formatting components and locale conventions for English
- Do not embed language-specific formatting rules in individual strings when a shared formatter exists

---

## 3. Arabic conventions

Language mechanics for Arabic UI copy — not Voice, Tone, or Patterns.

### Natural Arabic wording

**Applies when**  
Writing or reviewing Arabic user-facing copy.

**Rules**
- Use natural Arabic phrasing — not literal translation from English
- Prefer constructions that read fluently to Arabic speakers
- Do not import English sentence structure into Arabic

### RTL and copy

**Applies when**  
Copy appears in RTL interface contexts.

**Rules**
- Write copy that reads correctly in RTL layout
- Do not rely on left-to-right word order for meaning
- Keep embedded Latin terms (brands, acronyms) readable in context

### Arabic punctuation and grammar

**Applies when**  
Writing Arabic helpers, descriptions, and messages.

**Rules**
- Follow natural Arabic punctuation and grammar
- Do not mirror English punctuation rules when they conflict with Arabic usage

### Avoiding literal translation

**Applies when**  
Producing Arabic from an English source string.

**Rules**
- Translate meaning and intent, not word order
- Do not calque English idioms or UI patterns
- Use approved Arabic terminology where it exists

---

## 4. Applying the Foundation across languages

How Foundation decisions are expressed consistently in English and Arabic.

**Principles**
- Preserve meaning before wording
- Preserve intent before literal translation
- Preserve Voice and Tone, not sentence structure
- Approved terminology is mandatory in both languages
- Languages may differ in wording, length, or structure when meaning remains equivalent

**Rules**
- Apply the same Product Terminology concept in both languages using approved terms
- Apply the same Voice behavior and Tone situation in both languages
- Apply the same Writing Pattern intent in both languages
- Do not add or remove meaning in either language during adaptation
- Do not use Arabic as an opportunity to introduce concepts not approved in Terminology
- When adaptation requires a structural change, verify meaning equivalence before shipping

---

## 5. Terminology workflow

How Arabic and English terms stay synchronized. This section does not duplicate terminology tables.

**Process**

1. **Approve terms in Product Terminology** — English and Arabic entries live in the Terminology document, not here.
2. **Complete Arabic review as a system** — review Arabic terminology as a whole before wide copy changes, not term by term in isolation.
3. **Synchronize changes** — when a term changes in either language, update Product Terminology first, then dependent copy in `en.ts` and `ar.ts`.
4. **Do not ship divergent terms** — copy must not use Arabic or English labels that are not approved in Terminology.
5. **Escalate new concepts** — propose Terminology additions before introducing new product language in either language.

**Rules**
- Terminology changes require Product Terminology updates before application copy changes
- Content Matrix review may inform terminology updates but does not replace Terminology approval
- Implementation strings follow Terminology — Terminology does not follow implementation

---

## 6. Localization review

Verification criteria for bilingual copy. Use the same structure as the Review Checklist.

### Foundation parity

**Applies when**  
Any new or revised user-facing copy in English or Arabic.

**Verify**
- Does both language versions implement the same Foundation decision?
- Does neither language add or remove meaning?
- Was the governing parity rule applied?

**Fail action**  
Revise to restore parity, or Escalate through the Decision Framework.

---

### English conventions

**Applies when**  
English copy is new or revised.

**Verify**
- Does English copy follow Section 2 conventions?
- Does English copy use approved English terminology?

**Fail action**  
Revise English copy to comply.

---

### Arabic conventions

**Applies when**  
Arabic copy is new or revised.

**Verify**
- Does Arabic copy follow Section 3 conventions?
- Does Arabic copy use natural phrasing rather than literal translation?
- Does Arabic copy use approved Arabic terminology?

**Fail action**  
Revise Arabic copy to comply.

---

### Terminology synchronization

**Applies when**  
Copy references a product concept in either language.

**Verify**
- Do English and Arabic use approved terms from Product Terminology?
- Were terminology changes applied in Terminology before copy changed?
- Do both languages refer to the same concept?

**Fail action**  
Update Product Terminology first, then revise copy — or Escalate.

---

### Cross-language Foundation application

**Applies when**  
English and Arabic versions of the same surface exist.

**Verify**
- Do both versions follow Section 4 principles?
- Do Voice, Tone, and Pattern intent match across languages?
- Is meaning equivalent despite structural or length differences?

**Fail action**  
Revise to restore equivalence, or Escalate through the Decision Framework.

---

## Status

Structure locked. Foundation complete. Examples and editorial refinement may follow during implementation.
