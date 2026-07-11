# NUME Product Terminology

Approved product concepts in English and Arabic.

> **This document defines the approved terms for product concepts in NUME.**
>
> **Every user-facing reference to a defined concept must use the approved term in both English and Arabic.**
>
> **This document defines product concepts, not interface labels. Contextual wording is governed by the Writing Patterns document.**

**Status:** Complete — English locked · Arabic locked · 61 concepts  
**Runtime copy:** `src/lib/i18n/messages/en.ts` and `ar.ts` — updated in a later implementation step  
**Arabic column:** Approved here first; `ar.ts` is not the source of truth for terminology.

Arabic follows natural Egyptian/Modern Standard Arabic financial usage. Neither language is the source of the other.

---

## Actions

### Group 1 — Commitment & entry

| Concept | English | Arabic | Usage | Avoid |
|---|---|---|---|---|
| Save | Save | حفظ | Commit changes to an existing entity. Use "Save changes" only when extra clarity is needed. | Create, Add |
| Create | Create | إنشاء | Used when creating a new entity is the primary commit action. | Add, Save |
| Add | Add | إضافة | Enter a flow to create a new entity. | Create |
| Edit | Edit | تعديل | Open an existing item to change it. | — |
| Continue | Continue | متابعة | Advance through a flow without committing the final action. | Create, Save |

### Group 2 — Decision & destructive

| Concept | English | Arabic | Usage | Avoid |
|---|---|---|---|---|
| Archive | Archive | أرشفة | Remove an entity that can be restored later. | حذف |
| Delete | Delete | حذف | Permanently remove an entity. Permanence in description, not button label by default. | أرشفة |
| Discard | Discard | تجاهل | Abandon unsaved changes. | إلغاء |
| Cancel | Cancel | إلغاء | Dismiss or back out without confirming the current action. | تجاهل |

### Group 3 — Recovery

| Concept | English | Arabic | Usage | Avoid |
|---|---|---|---|---|
| Recovery | — | — | Internal concept only — no Arabic noun. Re-attempt after a failed action; all Arabic surface wording → Writing Patterns (e.g. حاول مرة أخرى). | تحديث, إعادة تحميل |

---

## Financial concepts

### Balance

| Concept | English | Arabic | Usage | Avoid |
|---|---|---|---|---|
| Balance | Balance | الرصيد | In most contexts, the current balance. Use "Current balance" / **الرصيد الحالي** only when extra clarity is needed. | الرصيد المستحق |
| Outstanding balance | Outstanding balance | الرصيد المستحق | Amount owed on a credit product. | الرصيد |

### Interest fundamentals

| Concept | English | Arabic | Usage | Avoid |
|---|---|---|---|---|
| Interest | Interest | العائد | Amount earned based on the annual rate. | المعدل السنوي, المبلغ الأساسي |
| Annual rate | Annual rate | المعدل السنوي | Rate expressed per year across the product. | سعر الفائدة |
| Principal | Principal | المبلغ الأساسي | Original amount before any interest is earned or paid. | الرصيد, العائد |

### Interest configuration

| Concept | English | Arabic | Usage | Avoid |
|---|---|---|---|---|
| Posting frequency | Posting frequency | تكرار الترحيل | When interest is applied within the same account. | تكرار الدفع |
| Posting day | Posting day | يوم الترحيل | Day posting occurs within the same account. | يوم الدفع |
| Payout frequency | Payout frequency | تكرار الدفع | When interest is paid out to a destination. | تكرار الترحيل |
| Payment day | Payment day | يوم الدفع | Day payout occurs to a destination. | يوم الترحيل |
| Interest payout | Interest payout | صرف العائد | When interest is paid to a destination account. | ترحيل |
| Interest destination | Interest destination | وجهة العائد | Where paid-out interest is sent. | ترحيل |

### Wealth position

| Concept | English | Arabic | Usage | Avoid |
|---|---|---|---|---|
| Net worth | Net worth | صافي الثروة | User's overall financial position, as calculated by NUME. | الرصيد, الأصول |
| Assets | Assets | الأصول | Financial value owned by the user. | الالتزامات, صافي الثروة |
| Liabilities | Liabilities | الالتزامات | Financial obligations owed by the user. | الأصول, صافي الثروة |

### Credit

| Concept | English | Arabic | Usage | Avoid |
|---|---|---|---|---|
| Credit limit | Credit limit | حد الائتمان | Maximum amount the user can borrow on a credit product. | الرصيد المستحق, الائتمان المتاح |
| Available credit | Available credit | الائتمان المتاح | Remaining capacity within the credit limit. Surface variants → Writing Patterns. | حد الائتمان, الرصيد المستحق |
| Utilization | Utilization | نسبة الاستخدام | Share of the credit limit currently in use. | حد الائتمان, الائتمان المتاح |
| Statement | Statement | كشف الحساب | Billing period summary of credit activity. | حد الائتمان |

### Time-bound deposits

| Concept | English | Arabic | Usage | Avoid |
|---|---|---|---|---|
| Term | Term | المدة | Duration of a time-bound deposit. | تاريخ الشراء, تاريخ الاستحقاق |
| Purchase date | Purchase date | تاريخ الشراء | When a time-bound deposit starts. | المدة, تاريخ الاستحقاق |
| Maturity date | Maturity date | تاريخ الاستحقاق | When a time-bound deposit ends. Use "استحقاق" in prose only. | المدة, تاريخ الشراء |
| Renewal | Renewal | التجديد | Action at maturity. See renewal values below. | المدة, تاريخ الاستحقاق |

**Renewal values** (documented under Renewal — not separate concepts):

| Value | English | Arabic |
|---|---|---|
| None | None | بدون |
| Renew principal | Renew principal | تجديد المبلغ الأساسي |
| Renew principal and earned interest | Renew principal and earned interest | تجديد المبلغ والعائد |

### Planning metrics

| Concept | English | Arabic | Usage | Avoid |
|---|---|---|---|---|
| Emergency fund | Emergency fund | صندوق الطوارئ | Money set aside to cover unexpected expenses. | التدفق النقدي, الصحة المالية |
| Cash flow | Cash flow | التدفق النقدي | Movement of money into and out of the user's finances over time. | صندوق الطوارئ, صافي الثروة |
| Financial health | Financial health | الصحة المالية | User's overall financial wellbeing, as assessed by NUME. | صافي الثروة, صندوق الطوارئ |

---

## Records

| Concept | English | Arabic | Usage | Avoid |
|---|---|---|---|---|
| Record | Record | السجل | Single entry representing financial activity in NUME. | الحساب, معاملة |
| Income | Income | دخل | Money entering an account. | مصروف, تحويل, تعديل |
| Expense | Expense | مصروف | Money leaving an account. | دخل, تحويل, تعديل |
| Transfer | Transfer | تحويل | Money moving between two accounts owned by the user. | دخل, مصروف, تعديل |
| Adjustment | Adjustment | تعديل الرصيد | Correcting an account balance when no real transaction occurred. | دخل, مصروف, تحويل |

---

## Account types

| Concept | English | Arabic | Usage | Avoid |
|---|---|---|---|---|
| Account | Account | الحساب | Container that holds a balance and represents a financial product. | السجل |
| Current account | Current account | حساب جاري | Day-to-day bank account. Short labels → Writing Patterns (**جاري**). | نقد, محفظة |
| Cash | Cash | نقد | Physical cash held by the user. | حساب جاري, محفظة |
| Wallet | Wallet | محفظة | Digital wallet or e-money balance. | حساب جاري, نقد |
| Savings account | Savings account | حساب توفير | Interest-bearing account for saved money. | حساب جاري, شهادة |
| Certificate | Certificate | شهادة | Fixed-term deposit with defined duration and return. | حساب توفير |
| Credit | Credit | ائتمان | Revolving credit facility with a borrowing limit and outstanding balance. | قرض |
| Loan | Loan | قرض | Borrowed amount repaid over time. | ائتمان |
| Gold | Gold | ذهب | Gold held as a financial asset. | أسهم |
| Stocks | Stocks | أسهم | Equity holdings tracked in NUME. | ذهب |

---

## Authentication

| Concept | English | Arabic | Usage | Avoid |
|---|---|---|---|---|
| Sign in | Sign in | تسجيل الدخول | Access NUME. | تسجيل الخروج, التسجيل |
| Sign out | Sign out | تسجيل الخروج | End an authenticated session. | تسجيل الدخول |
| Registration | Registration | التسجيل | Create access to NUME. Scenario phrasing (e.g. إنشاء حسابك) → Writing Patterns. | تسجيل الدخول |
| Email verification | Email verification | التحقق من البريد الإلكتروني | Confirm ownership of an email address. | إنشاء الحساب, إعادة تعيين كلمة المرور |
| Password reset | Password reset | إعادة تعيين كلمة المرور | Recover access by creating a new password. | التحقق من البريد الإلكتروني, تسجيل الدخول |

---

## Shared product concepts

| Concept | English | Arabic | Usage | Avoid |
|---|---|---|---|---|
| Profile | Profile | الملف الشخصي | User's personal information in NUME. | الحساب, مؤسسة مالية |
| Institution | Institution | مؤسسة مالية | Bank or financial provider associated with an account. Institution names → Content Matrix. Short labels → Writing Patterns. | الحساب, الملف الشخصي, المؤسسة |
| NUME | NUME | NUME | Product name. Do not alter spelling or capitalization. | — |

---

## Arabic terminology notes

### Conventions applied

| Topic | Decision |
|---|---|
| **Interest** | **العائد** — standard in Egyptian deposit/savings context; not **فائدة** |
| **Principal** | **المبلغ الأساسي** — established Egyptian banking term |
| **Posting vs payout** | **ترحيل** / **تكرار الترحيل** vs **دفع** / **صرف** / **تكرار الدفع** — distinct mental models preserved |
| **Statement** | **كشف الحساب** — fuller than **الكشف** alone for product concept |
| **Adjustment** | **تعديل الرصيد** — disambiguates from generic **تعديل** (Edit) |
| **Registration** | **التسجيل** — concept noun; surface **إنشاء حسابك** remains in Writing Patterns |
| **Recovery** | No Arabic concept noun — mirrors English **—**. All Arabic wording lives in Writing Patterns. |
| **Institution** | **مؤسسة مالية** — standard financial-domain term; avoids generic **المؤسسة** |
| **Loan** | **قرض** (singular) — not **قروض** |
| **Account types** | Full forms in terminology; shortened card labels via Writing Patterns |

### Deferred to Writing Patterns (not terminology)

- Available to spend → **المتاح للإنفاق** (surface variant of الائتمان المتاح)
- Save changes → **حفظ التغييرات**
- Create your account, Keep editing, purchase, payment, Try again
- Current → **جاري**; Savings card → **توفير**

### Next implementation step

Apply approved Arabic terms to `ar.ts` during Content Matrix review — not in this pass.

---

## Concept count

| Category | Concepts |
|---|---|
| Actions | 10 |
| Financial concepts | 25 |
| Records | 5 |
| Account types | 10 |
| Authentication | 5 |
| Shared product concepts | 3 |
| Renewal values | 3 |
| **Total** | **61** |

*Recovery has no English or Arabic concept noun. Renewal values are documented under Renewal.*
