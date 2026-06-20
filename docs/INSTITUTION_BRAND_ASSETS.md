# Institution brand assets

Local brand assets and registry for NUME institutions. Assets optimize for **recognition at 24–32px**, not branding completeness. This phase is infrastructure only — assets are not rendered in the app yet.

## Terminology

**Institution Brand Assets Registry** (formerly “Logo Registry”) — because assets may be:

| Tier | Type | Priority |
|------|------|----------|
| **A** | Official app icon | Preferred |
| **B** | Official brand mark | When no app icon |
| **C** | Compact logo (SVG) | When recognizable at small size |
| **D** | Fallback avatar | Last resort only |

## Asset layout

```text
public/institutions/{institutionId}.png   ← Tier A app icons
public/institutions/{institutionId}.svg   ← Tier B/C vector assets
```

File names match institution IDs from `src/lib/institutions/registry.ts`.

## Registry

- Types: `src/lib/institutions/brand-assets-registry-types.ts`
- Data: `src/lib/institutions/brand-assets-registry-data.json`
- Generated: `src/lib/institutions/brand-assets-registry.ts`
- Validation: `src/lib/institutions/brand-assets-registry-validation.ts`

Legacy aliases remain in `logo-registry.ts` for transitional imports.

Each entry has:

- `institutionId` — matches the institution registry ID
- `status` — `available` or `fallback`
- `tier` — `A`, `B`, `C`, or `D`
- `assetPath` — public path when available; `null` for fallback
- `assetFormat` — `png` or `svg` when available

## Collecting brand assets

```bash
npm run brand-assets:collect
```

1. **Tier A** — Downloads official consumer app icons from the Apple App Store (Egypt) via iTunes CDN, normalizes to 256×256 PNG.
2. **Tier B** — Stable brand marks from official sites or Wikimedia when App Store art is campaign/lockup art (see `scripts/brand-assets-stable-sources.mjs`).
3. **Tier C** — Downloads compact official SVGs when no app icon exists.
4. **Tier D** — Marks institutions with no recognizable asset as fallback.

Manifest: `scripts/brand-assets-manifest.mjs`  
Validation overrides: `scripts/brand-assets-stable-sources.mjs`

## Fallback strategy (future UI)

When no brand asset exists (Tier D), display a circular avatar with the first meaningful character of the institution label:

| Label | Fallback |
|-------|----------|
| CIB | C |
| NBE | N |
| Telda | T |
| OPay | O |
| valU | v |
| Custom / Other | First character of user-entered name |

Helper: `getInstitutionFallbackInitial()` in `src/lib/institutions/logo-fallback.ts`.

## Coverage (2026-06-20, validation pass)

| Tier | Count | Description |
|------|-------|-------------|
| **A** | 47 | Official app icons (stable, no campaign art) |
| **B** | 5 | Stable brand marks (Contact, Orange Cash, e& money, InstaPay, QNB Alahli) |
| **C** | 2 | Compact SVG (Credit Agricole, Meeza) |
| **D** | 3 | Fallback (MIDBank, Tamara, WE Pay) |
| **Total available** | **54** | |
| **Total institutions** | 57 | |

### Validation replacements (2026-06-20)

| Institution | Action | New source |
|-------------|--------|------------|
| Contact | Tier B SVG | contact.eg favicon |
| Orange Cash | Tier B SVG | Orange brand mark (Wikimedia) |
| e& money | Tier B SVG | e& symbol (Wikimedia) |
| InstaPay | Tier B PNG | instapay.eg site icon |
| QNB Alahli | Tier B PNG | QNB arrow mark (cropped app icon) |
| Tamara | Fallback | Gradient campaign app icon — no stable mark |
| WE Pay | Fallback | Complex lockup — no stable mark |

### Priority targets revisited

| Institution | Tier | Asset |
|-------------|------|-------|
| NBE | A | NBE Mobile app icon |
| Banque Misr | A | BM Online app icon |
| Banque du Caire | A | BDC Mobile Banking |
| QNB Alahli | A | QNB Egypt Mobile Banking |
| FABMISR | A | FABMISR Mobile |
| ADIB | A | ADIB Mobile Banking |
| Emirates NBD | A | Emirates NBD Egypt |
| InstaPay | A | InstaPay Egypt |
| Fawry | A | myfawry |
| Telda | A | Telda |
| OPay | A | OPay |
| Paymob | A | Paymob |
| Klivvr | A | Klivvr |
| Thndr | A | Thndr |
| Meeza | C | Official Meeza SVG |
| valU | A | Valu |
| Halan | A | Halan app icon |
| MIDBank | D | No app icon or SVG mark located |

### Upgraded from fallback (Phase 3 → Phase 4)

45 institutions restored or upgraded from the strict SVG-only audit, including all priority fintech targets above plus major banks and wallets.

### Still fallback

- **mid_bank** — no official Egypt app icon or compact SVG located

## Strategy rationale

Mobile banking and fintech users recognize **app icons** faster than horizontal wordmarks. A recognizable 512×512 app icon scaled to 24–32px outperforms a perfect SVG lockup users cannot parse at a glance.

A clean fallback (Tier D) remains preferable over a bad or unrecognizable logo — but fallback is now the exception, not the default.
