# Institution logos

Local logo assets and registry for NUME institutions. This phase is infrastructure only — logos are not rendered in the app yet.

## Asset layout

```text
public/institutions/{institutionId}.svg
```

File names match institution IDs from `src/lib/institutions/registry.ts`.

## Registry

- Types: `src/lib/institutions/logo-registry-types.ts`
- Data: `src/lib/institutions/logo-registry.ts`
- Validation: `src/lib/institutions/logo-registry-validation.ts`

Each entry has:

- `institutionId` — matches the institution registry ID
- `status` — `available` or `fallback`
- `logoPath` — public path when available; `null` for fallback
- `isOfficial` / `lastUpdated` — optional metadata for collected assets

## Collecting logos

```bash
npm run logos:collect
```

Downloads official SVGs (primarily from Wikimedia Commons files sourced from institution websites), normalizes them to a square 100×100 viewBox with padding, and writes assets to `public/institutions/`.

## Fallback strategy (future UI)

When no logo asset exists, display a circular avatar with the first meaningful character of the institution label:

| Label | Fallback |
|-------|----------|
| CIB | C |
| NBE | N |
| Telda | T |
| OPay | O |
| valU | v |
| Custom / Other | First character of user-entered name |

Helper: `getInstitutionFallbackInitial()` in `src/lib/institutions/logo-fallback.ts`.

Custom “Other” institutions always use fallback avatars.

## Coverage (2026-06-19)

| Status | Count |
|--------|-------|
| Total institutions | 57 |
| Available logos | 17 |
| Fallback | 40 |

### Available

**Banks (14):** cib, nbe, banque_misr, banque_du_caire, qnb_alahli, hsbc, alexbank, credit_agricole, fab, adcb, arab_bank, nbk, al_baraka, suez_canal

**Financial services (3):** vodafone_cash, orange_cash, etisalat_cash

### Fallback

**Banks (18):** aaib, saib, egbank, adib, faisal_islamic, mid_bank, emirates_nbd, hdb, edbe, united_bank, attijariwafa, kfh, abk, mashreq, bank_abc, aib, abe, bank_nxt

**Financial services (22):** we_pay, instapay, fawry, valu, aman, contact, money_fellows, telda, khazna, lucky, sympl, souhoola, paymob, meeza, opay, shahry, tabby, tamara, thndr, klivvr, bokra, mnt_halan

Fallback institutions lack acceptable official SVG sources in this pass. They can be added later without breaking registry consumers.
