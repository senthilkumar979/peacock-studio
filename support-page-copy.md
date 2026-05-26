# Peacock support page copy

Use this as a starting point for your public support page, help/contact page, or store support URL.

Replace all `{{...}}` placeholders before publishing.

## Page title

Peacock Support

## Intro copy

Need help with Peacock?

Peacock helps you record browser workflows and turn them into editable step-by-step documentation. If you need help with installation, recording, screenshots, sharing, or exports, use the information below to get support.

## Support contact

- Support email: `{{SUPPORT_EMAIL}}`
- Website: `{{WEBSITE_URL}}`
- Privacy policy: `{{PRIVACY_POLICY_URL}}`

## What to include when contacting support

To help us troubleshoot faster, please include:

- your browser (`Chrome` or `Edge`)
- your browser version
- whether you are using the unpacked extension or a store-installed version
- the Peacock version, if known
- the page or product you were using when the issue happened
- the exact steps to reproduce the issue
- screenshots or screen recordings if available
- any error message shown in the UI

## Common help topics

### 1. The extension loads but recording does not start

Check the following:

- the extension is enabled
- the page is a normal website page and not a restricted browser page
- you have reloaded the extension after rebuilding it
- the deployed app URL used by the extension is correct

### 2. Stopping a recording does not open the editor

Possible causes:

- the app URL configured in the extension is incorrect
- the deployed app is unavailable
- the extension and app were built with mismatched environment values

### 3. Screenshots are missing

Possible causes:

- the page changed too quickly during recording
- the screenshot was unavailable for that step
- browser permissions or tab context blocked capture

### 4. Full-page capture looks wrong

Please include:

- the site where it happened
- whether the page has sticky headers, cookie banners, or floating widgets
- whether the issue was repeated headers, broken stitching, or missing sections

### 5. A shared guide or saved doc is missing

Peacock currently uses a local-first browser storage model unless otherwise configured. That means saved docs may only exist in the browser profile where they were created.

If browser data was cleared or a different browser profile/device is used, the documentation may not be available there.

## Known browser limitations

Some browser behaviors can affect extension workflows:

- restricted browser pages cannot be recorded
- some websites with aggressive animations may affect screenshot timing
- sticky/fixed overlays can affect full-page captures on unusual layouts
- clearing browser storage can remove locally saved documentation

## Recommended troubleshooting steps

Before contacting support, try:

1. Refresh the page you are documenting.
2. Reopen the Peacock popup.
3. Reload the extension.
4. Confirm the app URL and extension build match.
5. Retry in a clean browser tab.

## Feature requests

If you want to request a feature, send:

- the feature idea
- the workflow you are trying to improve
- why the current behavior is not enough
- screenshots or examples if relevant

## Bug report template

You can use this template on your support page or issue tracker:

```text
Title:

Browser:

Extension version:

App URL:

What happened:

Expected behavior:

Steps to reproduce:

Screenshots / recordings:
```

## Closing copy

We aim to make Peacock reliable for real documentation workflows. Clear reproduction steps and screenshots help us resolve issues much faster.
