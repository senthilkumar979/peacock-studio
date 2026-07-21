# Peacock — Chrome Web Store submission guide

Use this document to complete the Chrome Web Store listing for the Peacock browser extension. Copy the text blocks directly into the Developer Dashboard fields mentioned in each section.

**Dashboard:** [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole)

**Production app URLs** (use these everywhere in the listing and build):

| Purpose | URL |
|---------|-----|
| App home | `https://peacock-studio.vercel.app` |
| Editor handoff | `https://peacock-studio.vercel.app/editor` |
| Privacy policy | `https://peacock-studio.vercel.app/privacy` |
| Terms | `https://peacock-studio.vercel.app/terms` |

---

## Quick checklist (maps to your errors)

| Store error | Where to fix | Section below |
|-------------|--------------|---------------|
| Permission justifications (`activeTab`, `clipboardWrite`, `host_permissions`, `scripting`, `storage`, `tabs`, remote code) | **Privacy practices** tab | [§ Permission justifications](#permission-justifications-privacy-practices-tab) |
| Single purpose description | **Privacy practices** tab | [§ Single purpose](#single-purpose-privacy-practices-tab) |
| Data usage certification | **Privacy practices** tab | [§ Data usage certification](#data-usage-certification-privacy-practices-tab) |
| At least one screenshot or video | **Store listing** tab | [§ Screenshots & promo media](#screenshots--promo-media-store-listing-tab) |
| Icon image is missing | **Store listing** tab | [§ Store icon](#store-icon-store-listing-tab) |
| Language is not selected | **Store listing** tab | [§ Language](#language-store-listing-tab) |
| Category not selected | **Store listing** tab | [§ Category](#category-store-listing-tab) |
| Detailed description too short | **Store listing** tab | [§ Detailed description](#detailed-description-store-listing-tab) |

After filling everything in, click **Save draft**, then review and **Submit for review**.

---

## Before you upload the ZIP

### 1. Build for production (not localhost)

The extension must know your **production** Peacock app URL so the editor handoff and bridge work after install.

From the repo root:

```bash
cd packages/extension
VITE_APP_URL=https://peacock-studio.vercel.app/editor pnpm build
```

This patches `manifest.json` so:

- The Peacock web app origin is included in `externally_connectable`
- The bridge content script runs on your production app (not only `localhost:5173`)

### 2. Create the upload ZIP

Zip the **contents** of `dist/`, not the `dist` folder itself:

```bash
cd dist
zip -r ../peacock-extension-v0.1.0.zip .
```

Upload `peacock-extension-v0.1.0.zip` on the **Package** tab.

Verify the ZIP contains at minimum:

- `manifest.json`
- `logo.png`
- `background/index.js`
- `content/index.js`
- `bridge/index.js`
- `popup/index.html`
- other bundled assets

### 3. Prepare store icon (128×128)

The manifest references `logo.png` (1000×1000), but the **Store listing icon** is a **separate upload** in the dashboard. Chrome requires a **128×128 PNG** with no alpha/transparency issues for the listing icon.

Generate from the repo logo:

```bash
cd packages/extension
sips -z 128 128 logo.png --out store-icon-128.png
```

Upload `store-icon-128.png` under **Store listing → Icon**.

Optional: also export 16, 48, and 128 PNGs if you later split manifest icon sizes for sharper toolbar icons.

---

## Store listing tab

### Extension name

**Peacock Studio**

Manifest `name` is already set to `Peacock Studio`. The store listing title can match or use **Peacock Studio — Flow Recorder** if you want extra clarity in search results.

### Manifest description (in `manifest.json`, ≤ 132 characters)

This appears in Chrome’s extension management UI (`chrome://extensions`) and in the packaged extension metadata. Keep it plain and benefit-focused:

```
Record clicks and screenshots on any site, then turn your workflow into step-by-step guides in Peacock Studio.
```

Rebuild after changing `packages/extension/manifest.json` so `dist/manifest.json` picks up the new text.

### Summary (short description, ≤ 132 characters)

Use the same wording as the manifest description, or this variant for the store listing:

```
Record clicks and screenshots on any site, then turn your workflow into step-by-step guides in Peacock Studio.
```

### Detailed description

Copy/paste (well over 25 characters):

```
Peacock Studio captures real browser workflows and turns them into polished, shareable documentation — without manual screenshot assembly.

HOW IT WORKS
1. Click the Peacock extension on any tab you want to document.
2. Start recording. Peacock captures clicks, text input, navigation, and synchronized screenshots.
3. Stop recording. Peacock opens the Studio editor with your steps ready to refine.
4. Edit titles, add sections, link branch paths, export PDF, or share a player link from the web app.

RECORDING FEATURES
• Start / pause / resume / stop from the popup
• Live step count and elapsed time
• Automatic screenshots tied to interactions
• SPA-aware navigation capture
• Password fields are never captured
• Auto-pause on sensitive URL patterns (login, payment, billing)
• Peacock UI hidden during capture

QUICK SCREENSHOTS (without recording)
• Visible viewport
• User-drawn selection
• Full-page scroll-and-stitch capture
• Copy to clipboard or download from the review page

LOCAL-FIRST BY DEFAULT
Recordings and screenshots stay in your browser until you open Peacock Studio. The extension hands off data to the web app you choose to open — it does not silently upload recordings to third-party servers.

Peacock Studio is built for product, QA, support, and enablement teams who need repeatable workflow guides, SOPs, onboarding docs, and release comparisons — captured from the live product, not recreated from memory.

Learn more: https://peacock-studio.vercel.app
Privacy policy: https://peacock-studio.vercel.app/privacy
Support: support@peacock.studio
```

### Category

**Primary:** `Productivity`

**Alternative if Productivity is unavailable:** `Developer Tools`

### Language

**English** (select **English** or **English (United States)** — whichever your dashboard offers).

Add other locales later if you translate the listing.

### Privacy policy URL

```
https://peacock-studio.vercel.app/privacy
```

Must be publicly reachable before submission. Update `packages/app/src/constants/legal.ts` if your production domain differs.

### Official URL (optional but recommended)

```
https://peacock-studio.vercel.app
```

### Support URL or email

```
support@peacock.studio
```

---

## Screenshots & promo media (Store listing tab)

Chrome requires **at least one** screenshot or video.

### Recommended sizes

| Asset | Size | Notes |
|-------|------|-------|
| Screenshot (recommended) | **1280 × 800** | Best for desktop listing |
| Screenshot (minimum acceptable) | **640 × 400** | Acceptable but less polished |
| Promo video | YouTube link | Optional |

### Suggested screenshots (capture these before submit)

1. **Extension popup — idle**  
   Show “Start recording”, current page hostname, quick screenshot dropdown.

2. **Extension popup — recording**  
   Show “Recording” badge, step count, Pause / Stop buttons.

3. **Recording on a real web app**  
   Browser window with a sample SaaS page + Peacock popup recording state (blur sensitive data).

4. **Peacock Studio editor after handoff**  
   Flow with steps and screenshots open in the web app.

5. **Quick screenshot result** (optional)  
   Screenshot review page with Copy / Download actions.

### Tips

- Use clean sample data; blur account names, emails, and tokens.
- Prefer light UI backgrounds consistent with Peacock branding.
- Save as PNG; keep file size reasonable (Chrome allows multiple screenshots).

---

## Store icon (Store listing tab)

Upload a **128×128 PNG** (`store-icon-128.png` from the command above).

This is **not** included in the ZIP — it is uploaded only in the Store listing form.

---

## Permission justifications (Privacy practices tab)

Paste each block into the matching justification field.

### Single purpose (Privacy practices tab)

```
Peacock Studio has a single purpose: to let users record browser workflows they perform on web pages and convert those interactions — with screenshots — into structured documentation in Peacock Studio. The extension only captures data when the user explicitly starts recording or invokes a screenshot tool from the popup.
```

### activeTab

```
Peacock uses activeTab to access the tab the user is viewing when they open the extension popup or start recording. Recording, screenshot capture, and step collection run only on the tab where the user initiated the action, rather than on background tabs without user intent.
```

### clipboardWrite

```
When a user captures a standalone screenshot (visible area, selection, or full page), Peacock shows a review page with a "Copy to clipboard" button. clipboardWrite is used only when the user clicks that button, so they can paste the image into another application without downloading a file first.
```

### Host permission (`<all_urls>`)

```
Peacock documents workflows on the websites and web applications users choose to record. Host permission is required to inject the bundled content script, observe user interactions, capture screenshots, and detect in-page navigation on those sites. Recording and screenshot tools run only after the user explicitly starts them from the extension popup. Peacock does not monitor or collect data from pages the user is not actively recording or capturing.
```

### scripting

```
Peacock injects its bundled content script into the active tab when the user starts recording or uses a screenshot tool. This ensures capture works on pages where the script is not already present, including single-page applications. All injected code is packaged inside the extension; no code is downloaded from external servers at runtime.
```

### storage

```
Peacock uses browser storage to keep in-progress recordings, captured screenshots, and quick-capture results on the user's device (chrome.storage.session and IndexedDB via Dexie). This allows recordings to survive popup closes and enables handoff to the Peacock Studio web app when the user stops recording. Data remains local to the browser unless the user separately chooses cloud features in the web app.
```

### tabs

```
Peacock uses the tabs API to: (1) identify the active tab when recording or screenshots start, (2) capture visible-tab screenshots, (3) open Peacock Studio after the user stops recording, (4) sync recording state when users switch tabs, and (5) detect navigation during multi-page workflows. Users always control when recording starts, pauses, and stops.
```

### Remote code use

```
Peacock does not execute remotely hosted code. All JavaScript executed by the extension is bundled in the published package and subject to Chrome Web Store review. The extension communicates with the Peacock Studio web application via Chrome messaging APIs to transfer recording data when the user opens the editor; it does not fetch, eval, or inject scripts from the network at runtime.
```

If the form offers **“No, I am not using remote code”**, select that option **and** still paste the justification above if a text field appears.

---

## Data usage certification (Privacy practices tab)

Certify compliance with the [Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies/). Use these answers as a guide when completing the data disclosure questionnaire.

### Does the extension collect or use user data?

**Yes.** Peacock processes data the user explicitly captures:

| Data type | Collected? | Purpose | Stored where |
|-----------|------------|---------|--------------|
| Page URLs & titles | Yes, during recording/capture | Build documentation steps | Extension IndexedDB / browser storage; then Peacock web app when user opens editor |
| Screenshots | Yes, during recording/capture | Illustrate workflow steps | Extension IndexedDB; handoff to web app |
| Interaction metadata (clicks, inputs, navigation) | Yes, during recording | Generate step descriptions | Extension IndexedDB; handoff to web app |
| Passwords / payment fields | **No** — excluded by design | — | — |
| Browsing history outside active capture | **No** | — | — |

### Data handling statements (typical form answers)

| Question | Answer |
|----------|--------|
| Is user data sold to third parties? | **No** |
| Is user data used for purposes unrelated to the extension’s single purpose? | **No** |
| Is user data transferred to third parties except as required to provide the service? | **No**, except optional cloud sync if the user signs in to Peacock Studio (web app feature, not automatic extension upload) |
| Can users request deletion? | **Yes** — delete docs in the app, clear browser storage, or uninstall the extension |

### Sensitive data

- **Password fields** are never captured in element snapshots.
- **Sensitive URL patterns** (login, payment, billing) trigger auto-pause during recording.
- Users should review screenshots before sharing and use blur/redact tools in Peacock Studio.

Check the certification box only after the privacy policy at `https://peacock-studio.vercel.app/privacy` accurately describes extension behavior.

---

## Manifest fields (source of truth)

Keep `packages/extension/manifest.json` aligned with the store listing before each release:

```json
{
  "name": "Peacock Studio",
  "description": "Record clicks and screenshots on any site, then turn your workflow into step-by-step guides in Peacock Studio.",
  "version": "1.0.1-beta"
}
```

Chrome limits `description` to **132 characters**. Bump `version` for every new upload to the Web Store.

Ensure `icons` entries point to appropriately sized PNGs (16, 48, 128) for crisp toolbar display.

---

## Submission workflow

1. Build production extension ZIP (`VITE_APP_URL` set).
2. Upload ZIP on **Package** tab.
3. Complete **Store listing** (description, category, language, icon, screenshots).
4. Complete **Privacy practices** (single purpose, permission justifications, data disclosure, certification).
5. **Save draft**.
6. Review all tabs for warnings.
7. **Submit for review**.

Review usually takes from a few hours to several business days. Google may request clearer permission wording or updated screenshots — adjust this file and resubmit as needed.

---

## Support contacts (keep in sync with the app)

| Field | Value |
|-------|-------|
| Company | Peacock Studio |
| Website | https://peacock-studio.vercel.app |
| Privacy | https://peacock-studio.vercel.app/privacy |
| Terms | https://peacock-studio.vercel.app/terms |
| Support email | support@peacock.studio |

Update `packages/app/src/constants/legal.ts` if any of these change before launch.
