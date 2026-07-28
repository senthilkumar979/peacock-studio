# Peacock extension deployment guide

This document covers what is needed to ship the Peacock browser extension to:

- Chrome Web Store
- Microsoft Edge Add-ons
- (Later) Firefox Add-ons — see [Phase 3: Firefox](#phase-3-firefox-amo-later)

It is tailored to the current repo structure and build flow.

## Chromium stores share one artifact

**Do not fork the Vite extension pipeline for Edge (or Brave/Opera).** Keep:

`vite build` → content → bridge → capture-tool

Chrome Web Store and Edge Add-ons both upload the **same** zip of `packages/extension/dist` (zip the **contents** of `dist/`, not the folder itself).

```bash
pnpm build:extension   # production VITE_APP_URL must be set
pnpm package:extension # optional: writes peacock-extension-<version>.zip from dist/
```

After Edge publishes, set `storeUrl` / `extensionId` for `edge` in [`packages/app/src/constants/extension.ts`](packages/app/src/constants/extension.ts). The SPA picks the preferred store link via `parseBrowserFamily` and probes all configured IDs (bridge-first).

**Never** set production `VITE_EXTENSION_ID` to a single-store ID on the shared SPA — that breaks the other browser. Leave it unset and rely on the bridge + the published ID registry.

## What Peacock needs before store submission

### 1. A deployed app URL

The extension depends on the React app for the editor and dashboard handoff flow.

Before building the production extension, deploy the app to a stable HTTPS URL such as:

`https://app.example.com/editor`

That URL is used for:

- opening the editor after recording stops
- popup shortcuts like `Open dashboard` and `Open editor`
- patching the manifest so the app origin is excluded from the recorder content script
- allowing the app origin in `externally_connectable`

The extension build reads this from `packages/extension/.env` via `VITE_APP_URL`.

### 2. Store-ready metadata

Prepare these before submission:

- extension title
- short description
- detailed description
- category
- support email
- support URL
- privacy policy URL
- screenshots
- icon/logo assets

### 3. Privacy and permission justification

The current extension requests:

- `activeTab`
- `clipboardWrite`
- `scripting`
- `storage`
- `tabs`
- `host_permissions: <all_urls>`

Because the extension can run on arbitrary product pages, the store listing must explain very clearly:

- the single purpose of the extension
- why site-wide access is needed
- why screenshot capture and tab information are needed
- what data is stored locally
- whether data leaves the browser

## Repo-specific deployment configuration

### Extension env

File:

`packages/extension/.env`

Required variable:

```env
VITE_APP_URL=https://your-domain.example.com/editor
```

This value is consumed in:

- `packages/extension/src/background/index.ts`
- `packages/extension/popup/popup.ts`
- `packages/extension/vite.config.ts`
- `packages/extension/src/build/patchManifest.ts`

### App env

File:

`packages/app/.env`

Optional variable:

```env
VITE_EXTENSION_ID=
```

Important:

- If you set `VITE_EXTENSION_ID`, the app will try that ID first (useful for unpacked local builds).
- Chrome, Edge, and Firefox store packages each get **different** extension IDs.
- For one SPA that works with every published store build: leave `VITE_EXTENSION_ID` unset; keep published IDs in `EXTENSION_STORE_BY_FAMILY` and rely on the injected bridge.
- Do not point production `VITE_EXTENSION_ID` at Chrome-only if Edge users share the same deploy.

## Build and package steps

### 1. Verify app deployment

Make sure the app is already deployed and reachable at the final `VITE_APP_URL`.

### 2. Set env files

Create:

- `packages/extension/.env`
- `packages/app/.env` if needed

### 3. Run validation

From the repo root:

```bash
pnpm typecheck
pnpm build:app
pnpm build:extension
```

### 4. Confirm the production extension output

The store upload artifact comes from:

`packages/extension/dist`

Verify that `dist` contains at least:

- `manifest.json`
- `logo.png`
- `background/index.js`
- `content/index.js`
- `bridge/index.js`
- `capture-tool/index.js`
- popup assets
- screenshot page assets

### 5. Zip the extension package

Zip the contents of `packages/extension/dist`, not the parent folder.

The root of the zip must contain `manifest.json`.

## Chrome Web Store checklist

Prepare:

- Google account for publisher access
- Chrome Web Store developer account
- one-time developer registration fee
- Manifest V3 zip package
- store listing copy
- screenshots
- privacy disclosures

Recommended listing assets:

- icon: `128x128`
- screenshots: `1280x800` or `640x400`
- small promo tile: `440x280` — [`packages/extension/store-assets/promo-small-440x280.png`](packages/extension/store-assets/promo-small-440x280.png) (24-bit PNG, no alpha)
- marquee promo tile: `1400x560` — [`packages/extension/store-assets/promo-marquee-1400x560.png`](packages/extension/store-assets/promo-marquee-1400x560.png) (24-bit PNG, no alpha)

Prepare these listing fields:

- name
- short description
- detailed description
- category
- screenshots
- privacy policy URL if applicable

Privacy/compliance items to answer carefully:

- single purpose statement
- permission justification
- data usage disclosure
- whether remote code is used

Important notes for Peacock:

- `host_permissions: <all_urls>` will require a strong justification
- if any user or page data is collected, transmitted, or stored outside the browser, your privacy policy and store disclosures must say so explicitly
- if everything remains local-first, say that clearly in both the listing and privacy policy

## Microsoft Edge Add-ons checklist

Prepare:

- Microsoft account
- Partner Center developer account
- Edge Add-ons listing metadata
- zipped extension package

Recommended listing assets:

- extension logo: recommended `300x300`, minimum `128x128`
- screenshots: up to 6, usually `640x480` or `1280x800`
- promo tiles (same as Chrome): [`packages/extension/store-assets/`](packages/extension/store-assets/) — small `440x280`, marquee `1400x560`

Prepare these listing fields:

- description
- logo
- screenshots
- privacy information
- privacy policy URL if required

Edge-specific notes:

- Partner Center may validate listing completeness per language
- if multiple languages are configured, each language can require its own complete metadata
- privacy information is handled in a dedicated privacy step/page in the submission flow

## Suggested store copy points for Peacock

### Single purpose

Peacock records browser workflows and converts them into editable step-by-step documentation with screenshots.

### Permission justification

- `activeTab` / `tabs`: needed to detect the active page, track page context, and open the editor/dashboard
- `scripting`: needed to inject recording and capture helpers into pages
- `storage`: needed for local-first recording data and saved screenshots
- `clipboardWrite`: needed for copy actions in screenshot and sharing flows
- `<all_urls>` host access: needed because users may record workflows on many different sites, not a fixed allowlist

### Data handling statement

Adapt this to your actual production behavior:

- recordings and screenshots are stored locally in the browser by default
- screenshots are used to build step-by-step documentation
- the extension does not transmit recorded content to a server unless the product later adds a remote sync/share backend

Do not claim this unless it is still true at release time.

## Release checklist

Before uploading to either store:

- update extension version in `packages/extension/manifest.json`
- keep `packages/extension/package.json` version aligned for internal consistency
- build using the final production `VITE_APP_URL`
- test on Chrome with a fresh install
- test on Edge with a fresh install
- verify stop-recording opens the deployed editor
- verify dashboard and editor popup links open the correct production URL
- verify the app origin is excluded from recorder injection
- verify app-extension handoff works on the deployed domain
- verify screenshots, full-page capture, and compare-docs flows still work
- verify there is no remote code usage
- verify privacy policy and store disclosures match the product exactly

## Post-release checklist

- save the final uploaded zip artifact
- note the published extension ID for Chrome
- note the published extension ID for Edge
- update `EXTENSION_STORE_BY_FAMILY` in `packages/app/src/constants/extension.ts` (URL + ID) for each new store
- leave shared production `VITE_EXTENSION_ID` unset (bridge + registry)
- test install/update from the store listing, not only unpacked mode
- monitor store review feedback and permission/privacy questions

## Phase 3: Firefox / AMO (later)

Firefox is **not** drop-in Chromium. Do **not** add a second Vite app or fork the Chromium build for AMO yet.

When ready, plan a **post-build packaging track**:

| Topic | Likely need |
|-------|-------------|
| APIs | `webextension-polyfill` or careful `browser.*` usage without rewriting Chromium call sites blindly |
| Manifest | `browser_specific_settings.gecko.id` (+ any AMO MV3/background requirements) |
| Restricted pages | `about:` / `moz-extension://` alongside existing `chrome://` / `edge://` guards |
| Packaging | Post-process `dist` → `dist-firefox` (manifest patch + zip); keep core Vite pipeline shared |
| Handoff | Bridge-first remains required |
| App CTA | Fill the existing `firefox` entry in `EXTENSION_STORE_BY_FAMILY` |

Safari remains out of scope (different distribution model).

Listing details for Edge: [`packages/extension/edge-addons.md`](packages/extension/edge-addons.md).
Chrome listing: [`packages/extension/web-store.md`](packages/extension/web-store.md).
Shared marketing copy: [`store-listing-copy.md`](store-listing-copy.md).

## Files relevant to deployment

- `packages/extension/manifest.json`
- `packages/extension/vite.config.ts`
- `packages/extension/src/build/patchManifest.ts`
- `packages/extension/src/background/index.ts`
- `packages/extension/popup/popup.ts`
- `packages/app/src/hooks/usePayload.ts`
- `packages/app/src/vite-env.d.ts`
- `packages/extension/src/vite-env.d.ts`

## Recommended next docs to prepare

You should also have these ready before store submission:

- public privacy policy page
- support page
- release notes template
- QA test checklist for extension release
- screenshots for Chrome listing
- screenshots for Edge listing
- promo tiles in `packages/extension/store-assets/` (small `440x280`, marquee `1400x560`)
