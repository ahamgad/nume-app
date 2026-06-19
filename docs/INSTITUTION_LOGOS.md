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

Downloads official SVGs (Wikimedia Commons, institution websites, and verified CDN assets), normalizes them to a square 100×100 viewBox with padding, writes assets to `public/institutions/`, and regenerates `logo-registry.ts`.

The collector uses `curl` as a fallback when a host returns malformed HTTP responses to Node `fetch`.

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

## Coverage (2026-06-19, second pass)

| Status | Count |
|--------|-------|
| Total institutions | 57 |
| Available logos | 38 |
| Fallback | 19 |

The 40+ logo target was not reached while keeping the SVG-only policy and official-source quality bar. Remaining high-priority institutions (Emirates NBD, InstaPay, Fawry, Telda, Thndr, valU, and several regional banks) publish PNG or raster-only brand assets.

### Available

**Banks (23):** cib, nbe, banque_misr, banque_du_caire, qnb_alahli, hsbc, alexbank, credit_agricole, aaib, fab, adcb, arab_bank, nbk, adib, faisal_islamic, al_baraka, attijariwafa, suez_canal, kfh, abk, mashreq, bank_abc, united_bank

**Financial services (15):** vodafone_cash, orange_cash, etisalat_cash, we_pay, opay, tabby, tamara, meeza, contact, aman, klivvr, paymob, money_fellows, mnt_halan, shahry

### Fallback

**Banks (9):** saib, egbank, emirates_nbd, hdb, edbe, aib, abe, bank_nxt, mid_bank

**Financial services (10):** instapay, fawry, valu, telda, khazna, lucky, sympl, souhoola, thndr, bokra

Fallback institutions lack acceptable official SVG sources in this pass. They can be added later without breaking registry consumers.
