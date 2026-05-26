# Peacock store listing copy

Use this as the starting point for Chrome Web Store and Microsoft Edge Add-ons listings.

Replace placeholders such as `{{...}}` before publishing.

## Product name

Peacock

## Tagline options

- Record workflows and turn them into polished docs
- Capture browser flows as step-by-step documentation
- Create documentation from real product workflows

## Short description options

### Option 1

Record browser workflows and turn them into editable step-by-step documentation with screenshots.

### Option 2

Capture real user flows, organize the steps, and share polished documentation from your browser.

### Option 3

Peacock records browser actions and converts them into reusable guides, SOPs, and product walkthroughs.

## Detailed description

Peacock helps teams capture real browser workflows and turn them into polished step-by-step documentation.

Use Peacock to:

- record clicks, inputs, navigation, and screenshots from live websites
- generate documentation steps from real user flows
- edit step titles, notes, and screenshots
- export polished guides
- share interactive documentation
- compare documents side by side

Peacock is useful for:

- product demos
- help center guides
- internal SOPs
- training and onboarding
- customer support workflows
- QA walkthroughs

### Key features

- Browser-based workflow recorder
- Screenshot capture, including full-page capture
- Editable documentation steps
- Player and document views
- Compare Docs workspace
- PDF export
- Local-first storage model

### Why teams use Peacock

Instead of rebuilding documentation manually, Peacock turns real browser activity into structured guides that can be reviewed, edited, and reused.

This helps teams document faster, reduce repetitive work, and keep guides closer to the actual product experience.

## Single purpose statement

Peacock records browser workflows and converts them into editable step-by-step documentation with screenshots.

## Permission justification

### `activeTab` and `tabs`

Used to detect the active page, capture context about the current workflow, and open the editor or dashboard when needed.

### `scripting`

Used to inject Peacock’s recorder and capture helpers into pages the user wants to document.

### `storage`

Used to store recordings, screenshots, and saved documentation locally in the browser.

### `clipboardWrite`

Used for copy actions such as screenshot copy or share-link copy initiated by the user.

### Host access / site access

Peacock can be used on many websites because users document workflows across different products and environments. Access is required so Peacock can capture the steps the user explicitly chooses to record.

## Privacy disclosure draft

Current intended disclosure template:

- Peacock stores recorded documentation and screenshots locally in the browser by default.
- Peacock does not sell user data.
- Peacock only processes the content necessary to record and present documentation workflows.

Update this if your production setup adds remote syncing, analytics, logging, or backend storage.

## Store screenshots to prepare

Recommended screenshot set:

1. Popup showing recording controls
2. Editor with step list and screenshot canvas
3. Document view
4. Player view
5. Compare Docs page
6. Full-page screenshot capture result

## Screenshot captions

- Record workflows directly from the browser
- Edit steps, notes, and screenshots
- Share guides in document or player mode
- Compare two docs side by side
- Capture full-page and selected screenshots

## Suggested category

Choose the best fit based on store options available at submission time, typically one of:

- Productivity
- Developer tools
- Workflow / business tools

## Support details

- Support URL: `{{SUPPORT_URL}}`
- Support email: `{{SUPPORT_EMAIL}}`
- Privacy policy URL: `{{PRIVACY_POLICY_URL}}`

## Review notes for store submission

If the store submission form provides a reviewer notes field, you can use:

Peacock is a documentation workflow recorder. The extension records browser interactions and screenshots only when the user intentionally starts a recording. Saved documentation is designed to remain local-first unless the product configuration explicitly introduces remote syncing or sharing.
