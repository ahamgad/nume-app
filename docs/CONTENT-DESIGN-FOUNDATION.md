# NUME Content Design Foundation

Navigation aid for contributors and AI. Each document below is authoritative within its scope.

## Document ownership

> **Each decision must have one authoritative home. Documents may reference each other, but ownership must not overlap.**

## Foundation scope map

| Document | Owns | Does not own |
|---|---|---|
| **Content Principles** | Writing priorities and decision hierarchy | Term names, tone, labels |
| **Product Terminology** | Approved product concepts | Interface labels, navigation, implementation |
| **Voice & Tone** | Communication behavior and situational tone | Term definitions, UI patterns |
| **Writing Patterns** | Interface labels, scenarios, flow copy, contextual wording | Product concepts, tone personality |
| **Navigation & IA** *(future)* | Module names, destinations, IA hierarchy | Product domain language |
| **Decision Framework** *(future)* | Resolving conflicts across documents | Defining concepts or tone |
| **Review Checklist** *(future)* | Gate before copy ships | Writing rules themselves |
| **Localization Guidelines** *(future)* | English ↔ Arabic rules | Concept definitions |

**Runtime copy:** `src/lib/i18n/messages/en.ts` and `ar.ts` — not the Content Matrix workbook.

**Historical:** `docs/CONTENT.md` mechanical rules (sentence case, punctuation) remain in force until reviewed and absorbed into this foundation.

## Decision precedence

When guidance appears to conflict, apply documents in this order. Higher entries win.

1. **Content Principles** — writing priorities
2. **Product Terminology** — approved concepts
3. **Voice & Tone** — communication behavior
4. **Writing Patterns** — contextual implementation
5. **Decision Framework** — conflict resolution and edge cases
6. **Review Checklist** — validation before shipping
7. **Localization Guidelines** — language-specific adaptation

## Status

| Document | Status |
|---|---|
| Content Principles | Locked |
| Product Terminology | Complete — English and Arabic locked (61 concepts) |
| Voice & Tone | Locked |
| Writing Patterns | Complete — structure and examples locked |
| Decision Framework | Locked |
| Review Checklist | Locked |
| Localization Guidelines | Locked |
| Navigation & IA | Future |

**Content Design Foundation — complete.** Remaining work is implementation: Content Matrix review and Navigation & IA when needed. Do not refine the framework unless a real gap appears during application.
