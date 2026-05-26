# Peacock extension release QA checklist

Use this checklist before uploading a new build to Chrome Web Store or Microsoft Edge Add-ons.

## Release metadata

- [ ] Update extension version in `packages/extension/manifest.json`
- [ ] Keep `packages/extension/package.json` version aligned if desired
- [ ] Confirm final production `VITE_APP_URL`
- [ ] Confirm whether `packages/app/.env` should set `VITE_EXTENSION_ID` or remain blank

## Build verification

- [ ] `pnpm typecheck`
- [ ] `pnpm build:app`
- [ ] `pnpm build:extension`
- [ ] Confirm `packages/extension/dist/manifest.json` exists
- [ ] Confirm `packages/extension/dist/logo.png` exists
- [ ] Confirm extension zip contains `manifest.json` at the root

## App + extension handoff

- [ ] Install the packed/unpacked extension in a clean browser profile
- [ ] Open the deployed app URL
- [ ] Start recording on a normal website
- [ ] Stop recording
- [ ] Confirm the deployed editor opens successfully
- [ ] Confirm the recorded flow is handed off correctly

## Popup QA

- [ ] Popup opens without errors
- [ ] `Start recording` works
- [ ] `Pause` appears during recording
- [ ] `Resume` appears when paused
- [ ] `Stop and open editor` works
- [ ] `Quick screenshots` is hidden during active recording
- [ ] `Open dashboard` opens the correct deployed app origin
- [ ] `Open editor` opens the correct deployed app origin

## Recording QA

- [ ] Initial page view is captured
- [ ] Click steps are recorded
- [ ] Input/select/radio interactions are recorded
- [ ] Step ordering works in the editor
- [ ] Step drag handle is visible
- [ ] Selecting a step in the editor scrolls it into view
- [ ] Duplicate step generation is not occurring unexpectedly

## Screenshot capture QA

### Manual screenshot modes

- [ ] `Capture visible part` works
- [ ] `Capture selection` works
- [ ] selection capture does not include the blue selection shade
- [ ] `Capture entire page` works
- [ ] full-page result opens in a new screenshot result tab
- [ ] download works from screenshot result page
- [ ] copy to clipboard works from screenshot result page

### Full-page capture edge cases

- [ ] fixed top header does not repeat on stitched output
- [ ] sticky header does not repeat on stitched output
- [ ] bottom banner or cookie banner does not repeat on stitched output
- [ ] floating widget or chat launcher does not repeat on stitched output
- [ ] delayed capture gives animations time to settle
- [ ] page state is restored after capture completes

## Editor QA

- [ ] editor loads saved flow correctly
- [ ] step notes and titles are editable
- [ ] custom step screenshot upload works
- [ ] reset custom screenshot works
- [ ] flow details modal works
- [ ] `Play` from editor opens the player/shared route correctly

## Shared doc + player QA

- [ ] `/docs/:documentId` opens doc mode by default
- [ ] `Doc / Player` toggle works
- [ ] player mode still works
- [ ] share link copies successfully
- [ ] copied share link opens the intended document
- [ ] step anchors work in doc mode
- [ ] copy-link-to-step works
- [ ] step index highlights the active step correctly
- [ ] clicking a step in the index navigates to the corresponding step

## Compare Docs QA

- [ ] `/compare` route loads successfully
- [ ] both document dropdowns populate
- [ ] left and right documents can be selected independently
- [ ] `Next step` advances both documents together
- [ ] `Previous step` moves both documents back together
- [ ] keyboard left/right navigation works
- [ ] mismatched step counts are handled gracefully
- [ ] screenshots and markers render on both sides

## Export QA

- [ ] PDF export works from editor/header
- [ ] PDF includes markers for click/input steps where supported
- [ ] exported PDF uses correct screenshots

## Cross-browser QA

### Chrome

- [ ] Fresh install works
- [ ] Update over existing install works
- [ ] No console/runtime errors during normal usage

### Edge

- [ ] Fresh install works
- [ ] Update over existing install works
- [ ] No console/runtime errors during normal usage

## Store compliance QA

- [ ] Permissions requested in manifest match actual behavior
- [ ] Store listing text matches current product behavior
- [ ] Privacy policy matches actual data handling
- [ ] No unintended remote code usage
- [ ] Screenshots and logos are store-ready
- [ ] Support URL and contact email are valid

## Final release artifacts

- [ ] Save the final app build identifier or deployment URL
- [ ] Save the final extension zip uploaded to the store
- [ ] Record Chrome extension ID after publish
- [ ] Record Edge extension ID after publish
- [ ] Save release notes for this version
