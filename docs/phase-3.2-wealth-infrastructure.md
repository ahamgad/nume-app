# Phase 3.2 — Wealth Infrastructure

Shared product architecture for NUME wealth assets. This document captures infrastructure decisions discovered during Certificates v1 implementation and Founder QA. It is the source of truth for **cross-asset rules** before Gold, Savings, Loans, and other asset types ship.

**Status:** Approved for alignment. **No implementation** in this phase — documentation only.

**Related:** [`docs/phase-3.1-certificates-domain.md`](./phase-3.1-certificates-domain.md) (Certificates-specific domain), `docs/NUME MVP V1.0.pdf` (PRD).

---

## Purpose

Define the shared rules that future asset types (Gold, Savings, Loans, Investments, etc.) will follow.

These decisions are extracted from real usage of NUME — not theoretical modeling. They govern:

* How assets participate in **Net Worth** and **Available Wealth**
* Which accounts can **receive or spend** money (records, transfers, automation)
* Which accounts may appear as **destinations** in pickers
* How **institutions** are shared across asset types
* The product philosophy for **Egyptian wealth representation**

Every new asset type must declare its row in the **Asset Capability Matrix** and its **institution category rules** before implementation begins.

---

## Product Principles (Shared)

Inherited from Certificates v1 and Founder QA:

* **Accounts are the Source of Truth** — Wealth calculations originate from account balances. Records are an audit layer; balances are not reconstructed from records alone.
* **Wealth-first, not expense-first** — Asset types are modeled by how Egyptians actually hold wealth, not by accounting categories alone.
* **Progressive Disclosure** — Ship configure, view, and computed expectations before automation. Do not expose unfinished flows as broken UI.
* **English + Arabic by default** — All user-facing strings in i18n catalogs. No hardcoded copy.
* **RTL by default** — Logical properties (`start`/`end`, `text-start`). Chevrons and row patterns follow existing RTL conventions.
* **Optional features must not break core data** — Core money data (accounts, records) must load independently of optional asset tables (learned from Certificates migration QA).

---

## 1. Asset Capability Matrix

This matrix drives **all future product decisions** for an asset type: dashboard inclusion, Goals/Planning eligibility, record flows, destination pickers, and automation.

### Definitions

| Capability | Meaning |
|--------------|---------|
| **Net Worth** | Contributes to total wealth calculation when active and `include_in_net_worth = ON`. |
| **Available Wealth** | Contributes to spendable / goal-fundable wealth (Planning, Goals, capacity). Locked or non-liquid holdings are excluded even when included in Net Worth. |
| **Transaction Capable** | Can directly receive or spend via the **records layer** (income, expense, adjustment) or future system payout records. User can add records on this account. |
| **Selectable Destination** | May appear in **destination account pickers** (interest payout, loan repayment, internal transfer, future automation). Subset of transaction-capable accounts. |

### Matrix

| Asset Type      | Net Worth      | Available Wealth | Transaction Capable | Selectable Destination |
| --------------- | -------------- | ---------------- | ------------------- | ---------------------- |
| Current Account | Yes            | Yes              | Yes                 | Yes                    |
| Cash            | Yes            | Yes              | Yes                 | Yes                    |
| Wallet          | Yes            | Yes              | Yes                 | Yes                    |
| Certificate     | Yes            | No               | No                  | No                     |
| Gold            | Yes            | No               | No                  | No                     |
| Savings         | Tentative: Yes | Tentative: Yes   | Tentative: Yes      | Tentative: Yes         |
| Loans           | TBD            | No               | No                  | No                     |

### Matrix rules

1. **Net Worth ≠ Available Wealth.** An asset may count toward total wealth without being goal-fundable or planning-eligible. Certificates established this pattern (see §1.1).
2. **Transaction Capable ⊆ Selectable Destination candidates.** Only transaction-capable accounts may be selectable destinations. The reverse is not true — not every transaction-capable account need appear in every picker (context-specific allowlists may apply later).
3. **Non-transaction-capable assets use configuration + engine displays**, not income/expense flows. Certificates do not show “Add Record”; Gold should follow the same pattern unless explicitly redesigned.
4. **New asset types require an explicit matrix row** before Phase 3.x implementation. “Tentative” rows must be confirmed before UI ships.

### 1.1 Available Wealth formula (approved baseline)

From Certificates v1 Founder QA:

```
Available Wealth = Net Worth − Required Emergency Fund − Locked Non-Liquid Principal
```

Where **Locked Non-Liquid Principal** currently includes:

* Active certificate principal (when `include_in_net_worth = ON`)

Future locked exclusions (Gold holdings, pledged assets, etc.) extend this term — they do not change Net Worth inclusion rules.

**Goals consume Available Wealth only**, not raw Net Worth (PRD Sequential Goals philosophy).

### 1.2 Loans (TBD)

Loans are **liabilities**, not assets. Net Worth treatment is **TBD** pending product decision:

* Likely: negative balance on loan accounts reduces Net Worth when `include_in_net_worth = ON`
* Available Wealth: **No** — loan balances are not spendable capacity
* Transaction Capable: **No** — loan accounts do not use the money-account record flow in v1
* Selectable Destination: **No** — repayments target liquid accounts, not loan accounts

Confirm liability sign convention and UI before Loans implementation.

---

## 2. Selectable Accounts Registry

### Concept

**Selectable Accounts ≠ All Accounts.**

The full accounts list (Accounts tab, Net Worth aggregation) includes every active wealth account type. **Selectable accounts** are a strict subset used only where money movement is implied.

Only accounts marked **Transaction Capable = Yes** in the matrix are eligible for the Selectable Accounts registry.

### Where selectable accounts appear

| Surface | v1 / future |
|---------|-------------|
| Interest destination pickers | Future (Certificates `destination_account_id`) |
| Loan repayment account pickers | Future (Loans) |
| Internal transfers | Future |
| Automation / system payout targets | Future (`auto_apply`, scheduled jobs) |

### Product rules

* **Certificates must never appear** in destination pickers. Principal is locked; interest automation (when it ships) posts to liquid accounts only.
* **Gold must never appear** in destination pickers. Gold is a held asset, not a cash endpoint.
* **Loans must never appear** as destinations. Repayments flow *from* liquid accounts *toward* loan balance reconciliation (future design).
* The registry is a **product rule**, not a UI filter hack. Service layer and picker data sources must enforce capability flags — not hardcoded type lists scattered in components.

### Implementation direction (future — not in this phase)

* Central `isTransactionCapable(type)` / `isSelectableDestination(type)` derived from the matrix
* Picker queries: `accounts WHERE status = active AND transaction_capable = true` (or equivalent capability metadata)
* Documented allowlist per picker context if needed (e.g. “liquid accounts only” vs “all transaction-capable”)

---

## 3. Institution Registry Strategy

### Concept

**Institutions are shared entities** used across asset types — not per-screen free text forever.

Users associate wealth with recognizable Egyptian banks and financial services. A single institution catalog ensures consistency (search, reporting, future analytics) while allowing manual fallback.

### V1 behavior (current direction)

| Rule | Detail |
|------|--------|
| **No Settings management** | Users do **not** manage institutions from Settings in v1. |
| **Picker-first** | Institutions are selected through **searchable pickers** at account/asset creation and edit. |
| **Free-text fallback** | Picker includes **`Other`**, which allows manual entry when the catalog does not list the user’s institution. |
| **Stored value** | Selected institution name is stored on the account row (`institution` text today; registry ID when catalog table ships). |

### Future evolution (not v1)

* `institutions` reference table with stable IDs
* User-added institutions via `Other` promoted to catalog candidates
* Institution linked to **category** (Bank vs Financial Service) for asset-type validation

---

## 4. Institution Categories (Egypt-first)

NUME catalogs reflect **how Egyptians actually name and interact with financial institutions** — not a generic global bank list.

### 4.1 Banks

Traditional deposit-taking and certificate-issuing banks.

**Seed examples (non-exhaustive):**

* National Bank of Egypt (NBE)
* Banque Misr
* Commercial International Bank (CIB)
* Qatar National Bank (QNB)
* HSBC Egypt
* AlexBank
* First Abu Dhabi Bank (FAB)
* Abu Dhabi Islamic Bank (ADIB)
* *(Others as needed)*

**Plus:**

```text
Other
```

### 4.2 Financial Services

Companies and products Egyptian users interact with for installments, wallets, investing apps, and non-bank financial services.

**This category is not “investment firms only.”** It represents **financial products and services** — BNPL, wallets, microfinance, retail investing apps, payment networks, etc.

**Seed examples (non-exhaustive):**

* Thndr
* Klivvr
* Souhoula
* ValU
* Contact
* MNT-Halan
* Telda
* Bokra
* Fawry
* Lucky

**Plus:**

```text
Other
```

### Category assignment

Each institution entry belongs to exactly one category: **Bank** or **Financial Service**. Asset types declare which categories are valid (see §5).

---

## 5. Institution Usage Rules

Institution **category eligibility is determined by asset type** — not user preference.

| Asset Type   | Allowed institution categories | Notes |
|--------------|----------------------------------|-------|
| Certificate  | **Banks** primarily              | Egyptian CDs and time deposits are bank products. Financial Services excluded unless product explicitly expands. |
| Loans        | **Banks + Financial Services**   | Bank loans, BNPL (ValU, Souhoula), microfinance (MNT-Halan), etc. |
| Savings      | **Banks**                        | Traditional savings accounts at banks. |
| Gold         | **TBD**                          | Likely: bullion dealers, banks with gold products, or generic “Other” — confirm before Gold spec. |
| Current / Cash / Wallet | Any (optional)          | Institution optional for money accounts; picker available when user wants it. |

### Future assets

Each new asset type document must include an **Institution Categories** subsection stating allowed categories explicitly. Implementation must filter picker options accordingly.

---

## 6. Product Philosophy

### Principle

**NUME models the real financial lives of Egyptian users.**

The goal is not theoretical financial purity or textbook portfolio taxonomy. The goal is **practical wealth representation** — what people actually hold, owe, and plan around.

### What this means in practice

| Real-life holding | NUME model |
|-------------------|------------|
| Bank checking account | Current Account — transaction-capable, full Available Wealth |
| Cash on hand | Cash — transaction-capable |
| Mobile wallet (Vodafone Cash, etc.) | Wallet — transaction-capable |
| Bank certificate / CD | Certificate — Net Worth yes, locked from Available Wealth |
| Gold (jewelry, bars, sovereign coins) | Gold — wealth asset, not a cash endpoint |
| Bank savings account | Savings — tentative full liquidity (confirm before ship) |
| Personal loan, BNPL, car loan | Loan — liability, not spendable |

Users should recognize their financial life in the app without learning a new taxonomy. Asset types map to **Egyptian mental models**, not US-centric “checking/savings/investment” defaults alone.

### Design consequences

* **Installments and BNPL** belong in the wealth model (Loans + Financial Services institutions) — not hidden in expense categories only.
* **Financial apps** (Thndr, Telda) are first-class institution names — not forced into “Bank.”
* **Locked wealth** (certificates, gold) counts in Net Worth but not in “what can I use for goals today?”
* **Copy and i18n** use Egyptian Arabic financial vocabulary users already use (شهادة، ذهب، قسط، etc.)

---

## 7. Founder QA Learnings (Infrastructure)

Decisions validated during Certificates vertical slice and stabilization — inform all future assets:

| Learning | Infrastructure rule |
|----------|---------------------|
| Optional asset tables must not block core finance load | Core `accounts` + `records` load independently; new asset tables fail soft until migrated |
| Optimistic store updates must not flip onboarding/mode UI | Flow mode locked at screen mount; core data readiness gated before type pickers |
| Date validation must use **local calendar** | Shared date helpers align with native date inputs (Egypt UTC+2/+3) |
| Matrix drives UI affordances | No “Add Record” on non-transaction-capable types; no destination pickers on locked assets |
| Archive = soft delete both layers | Account + asset config archived together; excluded from active lists and Net Worth |
| Dev seed helpers | Temporary, dev-only; never ship to production builds |

---

## 8. Implementation Sequence (Future — Not Started)

When an asset type moves from documentation to code:

1. Confirm matrix row (replace Tentative/TBD)
2. Confirm institution category rules
3. Domain doc (asset-specific, like Phase 3.1)
4. Migration + RLS (additive only)
5. Engine (pure computation) + service layer
6. Finance store extension (isolated load path)
7. Screens + i18n + RTL
8. Net Worth / Available Wealth wiring per matrix
9. Regression pass against money accounts and existing assets

**Gold is next candidate** — requires Phase 3.2 alignment sign-off and a dedicated Gold domain doc before any migration or UI.

---

## Document Control

| Field | Value |
|-------|-------|
| Phase | 3.2 — Wealth Infrastructure |
| Type | Product architecture (documentation only) |
| Supersedes | Ad-hoc per-feature capability assumptions |
| Does not supersede | `phase-3.1-certificates-domain.md` (Certificates-specific rules remain authoritative for Certificates) |
| Code changes | **None** in this phase |
