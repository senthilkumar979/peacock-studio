# Peacock Studio

## Product overview

Peacock Studio is a browser-based flow capture and documentation product for turning real user journeys into reusable product demos, SOPs, training guides, support artifacts, and side-by-side workflow comparisons.

The product has two parts that work together:

1. A browser extension that records actions directly on live websites.
2. A React web app that turns those recordings into editable, shareable documentation.

At a high level, Peacock helps a user go from "I just performed this workflow" to "I now have a polished walkthrough I can edit, present, export, share, and compare."

## Core workflow

### 1. Record a live flow

The user opens the browser extension from the toolbar and starts recording.

During recording, Peacock captures:

- page views
- clicks
- inputs
- navigation transitions
- screenshots tied to steps

The popup gives live session feedback without requiring a page refresh:

- current recording state
- step count
- elapsed session time
- current page/domain
- quick actions for start, pause, resume, stop, dashboard, and editor
- quick screenshot capture modes for visible area, selection, and full page

### 2. End recording and open the editor

When the user clicks stop recording:

- Peacock captures a final screenshot of the current page state
- adds a final page snapshot event
- opens the React editor in a new tab
- hands off the captured payload from the extension to the app

This is important because the last visible state is often the most useful one for documentation, especially after completing a workflow successfully.

### 3. Edit the documentation

Inside the editor, the user can:

- review all recorded steps
- reorder steps
- delete steps
- refine flow title and description
- adjust screenshots
- polish the narrative before sharing

The app auto-persists saved documents in IndexedDB in the browser for local-first storage.

### 4. Present, export, and share

Once a flow is saved, users can:

- open it in a readable document-style view
- play it back in a focused player UI
- export it as PDF
- copy a shareable link
- deep-link directly to individual steps
- compare two saved docs side by side
- reopen and continue editing later

## Key product features

### Browser extension

The extension is designed to feel lightweight, immediate, and non-disruptive.

Current extension capabilities include:

- toolbar popup with branded UI and live recording status
- no-refresh recording start from the current page
- pause/resume control
- stop-and-open-editor flow
- final screenshot capture when ending recording
- direct navigation shortcuts to dashboard and editor
- content script injection for event capture
- screenshot capture through the background worker
- quick screenshot modes for visible part, selection, and full-page capture
- screenshot result page with download and copy actions
- stitched full-page screenshots with repeated fixed/sticky overlays suppressed
- delayed post-scroll capture to reduce animation artifacts on dynamic pages

### Event capture model

Peacock captures high-value interaction signals, not just raw clicks.

Each step includes:

- event type
- timestamp
- page URL and title
- viewport context
- normalized click coordinates
- element metadata such as selector, role, labels, and DOM context
- screenshot linkage

This creates a step model that is useful both for human-readable documentation and for accurate playback.

### Better step descriptions

Peacock generates step titles and descriptions from the recorded event context.

Examples of the generated style:

- `Click Save and Close`
- `Enter State: Tamil Nadu`
- `Select Country: India`
- `Open Checkout Review`

And richer descriptions such as:

- `On the Order page, click the Save and Close button to save the form.`
- `On the Address page, enter "Tamil Nadu" in the State field for country India.`
- `Open Checkout Review at https://example.com/checkout/review.`

This makes flows easier to understand, edit, and present without requiring the user to rewrite every step manually.

### Dashboard and flow library

The dashboard acts as a documentation workspace rather than just a file list.

It includes:

- hero section with branded positioning
- documentation stats
- latest documentation highlight
- card/list/table browsing modes
- search
- sorting
- compare-docs entry point from the workspace
- delete flow action
- empty states and onboarding guidance
- local footer messaging for browser-stored data

### Editor experience

The editor is optimized for turning a raw recording into a polished deliverable.

Current editor capabilities:

- editable flow metadata
- step list for sequencing and review
- visible drag handle for step reordering
- detail panel for step-level changes
- canvas area for screenshot review
- auto-save behavior for persisted documents
- export and share actions from the header
- dashboard back navigation

### Player experience

The player is designed for guided walkthrough consumption.

Capabilities include:

- document-style shared view for step-by-step reading
- step-by-step playback
- previous/next navigation
- autoplay
- keyboard navigation
- doc/player toggle from the same shared route
- per-step deep links
- mini step index for long-form document navigation
- direct jump back to edit mode
- export and share actions from the header

### Compare Docs experience

Peacock now includes a dedicated Compare Docs page for side-by-side walkthrough review.

Capabilities include:

- two document dropdowns for choosing the saved docs to compare
- synchronized previous/next step navigation across both docs
- keyboard navigation for comparison
- side-by-side screenshots and step content
- graceful handling when one document has fewer steps than the other

### Local-first persistence

Peacock currently stores saved documents in IndexedDB in the browser.

Benefits of this model:

- very fast local access
- no backend dependency for the current workflow
- privacy-friendly default storage model
- simpler onboarding for early demos and pilots

Important note:

- documents are scoped to the browser and origin
- `localhost` and production deployments have different IndexedDB databases

## Architecture summary

### Monorepo structure

- `packages/extension` — browser extension
- `packages/app` — React app
- `packages/shared` — shared types and utilities

### Shared package

The shared package provides:

- event types
- handoff message types
- coordinate utilities
- selector/xpath helpers
- masking helpers
- step description generation
- flow step creation

This keeps the extension and web app aligned around a single recording schema.

### Extension responsibilities

- capture browser interactions
- store temporary recording data
- manage recording state
- capture screenshots
- build the handoff payload
- open the editor

### App responsibilities

- hydrate the handoff payload
- save the resulting document
- render dashboard/editor/player/compare views
- export PDF
- generate share links

## Customer value proposition

Peacock is valuable because it turns product activity into customer-facing documentation with almost no friction.

### Primary benefits

- Faster documentation creation
  - teams can document workflows by doing them once instead of writing from scratch

- Better product demos
  - recordings can become guided walkthroughs and demo assets

- Better onboarding and training
  - internal teams can create repeatable SOPs and enablement content quickly

- Better customer support
  - support and success teams can turn issue-resolution steps into reusable guides

- Better product marketing
  - product-led teams can create interactive “how it works” content from real product journeys

### Why customers would care

- reduces time spent writing process docs manually
- keeps screenshots and action descriptions in sync
- produces more consistent documentation across teams
- makes complex workflows easier to explain
- shortens the path from product action to usable customer artifact

## Ideal target users

Peacock is especially relevant for:

- product marketing teams
- customer success teams
- solutions engineers
- sales engineers
- support teams
- operations and enablement teams
- SaaS founders demonstrating workflows

## Example use cases

### Customer onboarding guide

Record the setup flow once, clean up the steps, export a PDF, and share a hosted version with every new customer.

### Internal SOP creation

Operations teams can record a workflow in the admin panel and turn it into a repeatable internal process document.

### Support macro content

Support teams can reproduce a fix, save the flow, and share the player link with customers instead of rewriting instructions.

### Product demo storytelling

A sales engineer can record a polished product journey and use the player as a lightweight guided demo.

### Workflow regression comparison

Teams can open two saved docs side by side and walk through them step-by-step to review UI changes, flow changes, or release differences.

## Differentiators

What makes Peacock interesting compared with manual screenshot docs or generic screen recorders:

- captures structured interaction data, not just video
- produces editable steps, not just a passive recording
- couples screenshots with the exact user action
- supports both internal documentation and external presentation
- supports both document and player consumption modes from the same shared route
- supports side-by-side doc comparison for release review and regression analysis
- local-first by default for speed and privacy
- can evolve into richer collaboration, analytics, and publishing workflows

## Current strengths

- clear end-to-end recording-to-editor flow
- polished dashboard and playback surfaces
- shared event model across app and extension
- improved popup UX
- better auto-generated step language
- richer screenshot tooling, including visible, selection, and full-page capture
- shared document mode with step anchors and direct step links
- side-by-side compare-docs workflow
- PDF export and share support

## Current limitations

This is important context for anyone using this document to reason about roadmap or product positioning.

- storage is currently browser-local, not team-shared backend storage
- share links point to documents in the current app instance; long-term collaboration storage is still a future opportunity
- Chrome extension integration needs rebuild/reload discipline when env values change
- production and localhost behave as different storage environments by design
- compare mode currently aligns docs by step index rather than semantic diffing

## Recommended positioning statement

Peacock Studio is a browser flow capture and documentation platform that converts real product usage into editable walkthroughs, shareable demos, comparable doc pairs, and exportable SOPs in minutes.

## Short pitch

Peacock helps teams record a workflow once and instantly turn it into a polished customer-facing guide, internal SOP, product demo, or comparison artifact, complete with screenshots, structured steps, playback, export, and sharing.

## Longer pitch

Peacock Studio removes the manual work from workflow documentation. Instead of taking screenshots, writing step titles, formatting instructions, and maintaining separate demo assets, a user records the real interaction directly in the browser. Peacock captures the journey, generates structured steps, opens an editor for refinement, and lets the team present, export, share, or compare the result. The outcome is faster documentation creation, more consistent enablement assets, and better product storytelling.

## Suggested roadmap themes

If this document is used to brief Claude or another model, these are the most natural expansion areas:

- cloud-backed persistence and team workspaces
- comments and collaboration
- richer public sharing
- semantic diffing and smarter compare workflows
- reusable templates
- analytics on viewed/shared flows
- deeper redaction and compliance tooling
- AI-assisted rewrite and summarization of steps
- multi-product libraries and categorization

## One-line summary for AI assistants

Peacock Studio is a browser extension + React app workflow recorder that captures browser actions and screenshots, converts them into editable documentation steps, and lets users manage, compare, play, export, and share those flows.
