# Peacock — Microsoft Edge Add-ons submission guide

Use this document with [store-listing-copy.md](../../store-listing-copy.md) and the privacy answers in [web-store.md](web-store.md) (permission justifications are the same Chromium MV3 package).

**Dashboard:** [Microsoft Partner Center — Edge Add-ons](https://partner.microsoft.com/dashboard/microsoftedge/overview)

**Important:** Upload the **same** production zip as Chrome Web Store. Do not fork the Vite build for Edge.

**Production app URLs:**

| Purpose | URL |
|---------|-----|
| App home | `https://peacock-studio.vercel.app` |
| Editor handoff | `https://peacock-studio.vercel.app/editor` |
| Privacy policy | `https://peacock-studio.vercel.app/privacy` |
| Terms | `https://peacock-studio.vercel.app/terms` |

---

## Before you upload

### 1. Build the Chromium package once

From the repo root (with production `VITE_APP_URL`):

```bash
pnpm build:extension
pnpm package:extension
```

Or manually:

```bash
cd packages/extension
VITE_APP_URL=https://peacock-studio.vercel.app/editor pnpm build
cd dist && zip -r ../peacock-extension.zip .
```

The zip root must contain `manifest.json`.

### 2. Listing logo (300×300 preferred)

Edge prefers a **300×300** PNG logo (minimum 128×128). Generate from the repo logo:

```bash
cd packages/extension
sips -z 300 300 logo.png --out store-icon-edge-300.png
sips -z 128 128 logo.png --out store-icon-128.png
```

These are **listing uploads only** — do not change how Vite copies `logo.png` into `dist/` for the extension runtime.

### 3. Screenshots

Prepare up to 6 screenshots (typically `1280×800` or `640×480`). Reuse Chrome listing shots when they still match the product.

### 4. Promo tiles (optional but recommended)

Reuse the Chrome-ready assets in [`store-assets/`](store-assets/):

- Small: `promo-small-440x280.png` (`440×280`, 24-bit PNG, no alpha)
- Marquee: `promo-marquee-1400x560.png` (`1400×560`, 24-bit PNG, no alpha)

---

## Partner Center fields

Reuse copy from [store-listing-copy.md](../../store-listing-copy.md) and the detailed description in [web-store.md](web-store.md).

| Field | Guidance |
|-------|----------|
| Name | Peacock Studio |
| Short / detailed description | Same single-purpose story as Chrome |
| Category | Productivity / Developer tools (closest match) |
| Support / privacy URLs | Production app privacy + terms above |
| Permissions | Justify `activeTab`, `clipboardWrite`, `scripting`, `storage`, `tabs`, `<all_urls>` — same text as Chrome privacy practices |

Partner Center may require complete metadata per language if you enable multiple locales — start with English only.

---

## After approval

1. Copy the Edge Add-ons listing URL and the published extension ID.
2. Set them on the `edge` entry in [`packages/app/src/constants/extension.ts`](../app/src/constants/extension.ts):

```ts
edge: {
  storeUrl: 'https://microsoftedge.microsoft.com/addons/detail/...',
  extensionId: '<edge-extension-id>',
  label: 'Edge Add-ons',
},
```

3. Redeploy the SPA so Edge users get Edge store CTAs and runtime ID probing.
4. Leave shared production `VITE_EXTENSION_ID` unset.
5. Smoke-test: install from Edge Add-ons → record → stop → editor handoff on the production origin.

---

## Related docs

- [extension-store-deployment.md](../../extension-store-deployment.md) — packaging + dual Chromium upload
- [web-store.md](web-store.md) — Chrome listing / privacy justifications
- [release-qa-checklist.md](../../release-qa-checklist.md) — Chrome + Edge QA
