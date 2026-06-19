# Peacock Studio

## Product overview

Peacock Studio is a browser-based flow capture and documentation product for turning real user journeys into reusable product demos, SOPs, training guides, support artifacts, persona-led product tours, and side-by-side workflow comparisons.

The product has two parts that work together:

1. A **browser extension** that records actions and captures screenshots directly on live websites.
2. A **React web app** that turns those recordings into editable, shareable documentation and multi-demo product tours.

At a high level, Peacock helps a user go from "I just performed this workflow" to "I now have a polished walkthrough I can edit, branch, tour, present, export, share, and compare."

---

## Core workflow

### 1. Record a live flow

The user opens the browser extension from the toolbar and starts recording (with an optional countdown before capture begins).

During recording, Peacock captures:

- page views (initial and final)
- clicks
- text inputs, selects, checkboxes, and radios
- navigation transitions
- screenshots tied to interaction steps

The popup gives live session feedback without requiring a page refresh:

- current recording state (idle, recording, paused)
- step count
- elapsed session time
- current page/domain
- quick actions for start, pause, resume, stop, dashboard, and editor
- quick screenshot capture modes (visible area, selection, full page) when not actively recording

### 2. End recording and open the editor

When the user clicks **Stop and open editor**:

- Peacock captures a final screenshot of the current page state
- adds a final page snapshot event
- opens the React editor in a new tab
- hands off the captured payload from the extension to the app via a bridge message
- saves the result as a new document in the local library (IndexedDB)

### 3. Edit the documentation

Inside the editor, the user can refine the raw recording into a polished deliverable (see **Flow editor** below).

The app auto-persists saved documents in IndexedDB for local-first storage.

### 4. Present, export, and share

Once a flow is saved, users can:

- open it in a readable document-style view
- play it back in a focused player UI
- export it as PDF (with optional branch-path selection)
- copy a shareable link (readonly or editable)
- deep-link directly to individual steps
- compare two saved docs side by side
- bundle multiple docs into a persona-led product tour
- reopen and continue editing later

---

## Implemented features (detailed)

### Screenshot capture (multiple ways)

Peacock supports screenshots through several distinct paths, each suited to a different moment in the workflow.

#### 1. Automatic screenshots during recording

While recording is active, Peacock captures screenshots in sync with user actions:

- **Pointer-down pre-capture** — on mousedown, a screenshot request begins so the image reflects the UI state at click time.
- **Click steps** — each click stores a screenshot linked to the step (Peacock UI elements and sensitive password fields are excluded from click capture).
- **Input steps** — debounced input/select/radio changes capture a screenshot after the value settles.
- **Page views** — the initial page and final page snapshot (on stop) include screenshots.
- **Recording UI hidden during capture** — the in-page recording badge is temporarily hidden so it does not appear in screenshots.

Screenshots are stored as blobs in the extension's IndexedDB during recording, then transferred to the web app on handoff.

#### 2. Quick screenshot modes (extension popup)

When not actively recording, the extension popup exposes three standalone capture modes:

| Mode | Behavior |
|------|----------|
| **Visible area** | Captures the currently visible viewport of the active tab. |
| **Selection** | User draws a rectangle on the page; only that region is captured (selection overlay is excluded from the result). |
| **Full page** | Stitches the entire scrollable page by scrolling and capturing viewport slices. |

Full-page capture includes production-quality handling:

- fixed and sticky headers/footers are tracked and suppressed so they do not repeat on every slice
- floating widgets (chat launchers, cookie banners) are suppressed similarly
- a post-scroll settle delay reduces animation artifacts on dynamic pages
- page scroll position is restored after capture completes

Quick captures open a **screenshot result page** with download and copy-to-clipboard actions, and can optionally open the **Capture Editor** for further polish.

#### 3. Capture Editor (standalone screenshot polish)

Route: `/capture/:captureId/edit`

After a quick capture, users can open the Capture Editor to prepare marketing- or support-ready images:

- **Tools:** Select, Crop, Blur, Redact (privacy regions)
- **Caption:** title and description overlay
- **Background presets:** decorative frames/gradients around the screenshot
- **Layout:** adjustable padding and corner radius
- **History:** undo/redo (up to 30 states)
- **Export:** download PNG or copy to clipboard

Privacy regions use normalized coordinates (0–1) so redaction boxes scale correctly when the composite image is rendered.

#### 4. Replace screenshot on a flow step (editor)

In the flow editor, each step has a **Step image** panel:

- upload a replacement image (JPEG, JPG, PNG, or SVG)
- the custom image overrides the captured screenshot for display, player, document view, and PDF export
- **Reset to captured** restores the original recording screenshot and removes the custom upload

Manual steps (added in the editor without recording) start with a placeholder screenshot until the user uploads an image.

---

### Capture user actions

Peacock captures structured interaction data, not just pixels.

#### Event types

| Event | What is captured |
|-------|------------------|
| `click` | Normalized click position, element snapshot, viewport, page URL/title, screenshot |
| `input` | Form control metadata, value preview (masked when sensitive), screenshot |
| `navigation` | From/to URLs (no screenshot) |
| `page-view` | URL, title, viewport, screenshot |

#### Element metadata

Each interaction step includes rich DOM context used for playback markers and auto-generated descriptions:

- CSS selector and XPath
- tag, role, classes, inner text
- label associations (aria-label, placeholder, associated `<label>`)
- parent/grandparent context
- data attributes

#### Privacy and safety

- password and other sensitive fields are excluded from click/input capture
- Peacock's own UI elements are ignored
- sensitive URL patterns can pause or guard recording (login, payment, billing flows)
- Capture Editor supports blur and redact regions for post-capture sanitization

#### Normalized coordinates

Click markers and privacy regions use normalized floats (0–1), not raw pixels, so highlights stay accurate when screenshots are resized in the editor, player, document view, or PDF.

#### Auto-generated step language

Peacock generates step titles and descriptions deterministically from captured element context (not AI):

- `Click Save and Close`
- `Enter State: Tamil Nadu`
- `Select Country: India`
- `On the Order page, click the Save and Close button to save the form.`

Users can override titles and add freeform notes in the editor.

---

### Document creation and library

#### Creating a document

1. Install the Chrome/Edge extension.
2. Navigate to any website and start recording.
3. Perform the workflow.
4. Stop recording — the app opens `/editor`, receives the handoff payload, hydrates the flow store, and saves a new document to IndexedDB.
5. A **Flow details** modal prompts for title and description on first open.

#### Dashboard workspace

Route: `/`

The dashboard is the documentation home:

- hero section with stats (document count, steps, etc.)
- **Product tours** section (separate from single docs)
- featured latest document highlight
- flow library with **card, list, and table** view modes
- search and sort (newest, oldest, title)
- delete documents and tours
- entry point to **Compare Docs**
- redirects to landing page when the library is empty

#### Local-first persistence

- documents, screenshots, product tours, and personas are stored in IndexedDB on the current browser origin
- auto-save runs as the user edits in the editor or tour builder
- `localhost` and production deployments use separate databases

---

### Flow editor

Route: `/editor` (new handoff) or `/docs/:documentId/edit` (saved doc)

Three-column layout: **Outline** | **Canvas preview** | **Detail panel**

#### Outline actions

- **Add step** — inserts a manual step after the current selection (blank title, placeholder screenshot, editable notes)
- **Add section** — inserts a chapter/section divider (title + description; shown in document view, not player)
- **Create a branching point** — inserts a branch node linked to another saved document
- **Drag to reorder** — visible drag handle on each outline item
- **Delete** — remove steps, sections, or branches

#### Step editing

- edit title and notes
- upload or replace step screenshot (see above)
- view generated description (read-only reference)
- canvas preview with click marker overlay
- delete step

#### Section editing

- edit section title and description
- sections group content in document view; they are skipped during player step playback

#### Branch editing

- edit branch title, description, and layout (list vs grid for 4+ options)
- add multiple **paths**, each linking to a saved document with a step range (`fromStepId` → `toStepId`) and label
- remove individual paths or delete the entire branch

#### Flow metadata

- title and description via Flow details modal
- Play link opens the shared player route
- Share and PDF export from the header

---

### Branching documents

Branching lets one document fork into linked sub-flows without duplicating content.

#### How it works

1. In the editor, click **Create a branching point**.
2. Pick a target saved document from the library.
3. Choose the step range within that document to play when a path is selected.
4. Give the path a label (e.g. "Admin setup" vs "Member setup").
5. Add more paths to the same branch for multi-option decision points.

#### Playback behavior

- In **player mode**, reaching a branch shows a choice panel (list or grid layout).
- Selecting a path loads the linked document's step slice inline, then returns to the host document flow.
- In **document mode**, branches render as cards describing each path option.
- **Share links** and **PDF export** support choosing which branch paths to include for readonly shared views.

Branch metadata is stored on the host document; target documents remain independent and reusable.

---

### Compare Docs

Route: `/compare`

Side-by-side review of two saved documents:

- dropdown selectors for left and right documents
- synchronized **Previous / Next step** navigation across both panes
- keyboard arrow-key navigation
- step screenshots, titles, and markers rendered in parallel
- graceful handling when documents have different step counts (empty pane on the shorter side)

Compare aligns documents by **step index**, not semantic diffing — useful for release review, UI regression checks, and before/after workflow comparison.

---

### Shared document view and player

Route: `/docs/:documentId`

Toggle between **Doc** and **Player** modes on the same URL (`?view=player` for player mode).

#### Document mode

- long-form, scrollable step-by-step reading layout
- section cards and branch cards inline with steps
- mini step index sidebar with active-step highlighting
- per-step anchor links (`#step-…`) for deep linking
- copy link to current step
- export and share from header

#### Player mode

- focused step-by-step playback with browser mockup framing
- previous/next controls and progress indicator
- **autoplay** (spacebar toggle; ~2.5s per step)
- keyboard navigation (arrows, space)
- branch choice panels at decision points
- linked path playback for branch selections
- finale screen at guide completion
- jump to edit mode

#### Share settings

Share modal supports:

- **Link** — readonly or editable access URLs
- **PDF** — export with branch path selection when branches exist
- **Embed** — placeholder (not yet implemented)
- readonly links can encode branch path preferences via query parameters

---

### Product tours

Product tours bundle multiple saved documents into a persona-led, multi-chapter guided experience — distinct from a single linear doc.

#### Data model

| Concept | Purpose |
|---------|---------|
| **Tour** | Top-level container with title, description, draft/live status |
| **Persona** | Buyer/user role the tour speaks to (name, title, company, avatar) |
| **Feature** | A chapter grouping related demos (title + description) |
| **Demo** | A reference to a saved Peacock document, ordered within a feature |
| **Completion CTA** | Optional button (label + URL) on the final slide |

Tours and personas persist in IndexedDB alongside documents.

#### Tour builder

Routes: `/tours/new` (creates and redirects) → `/tours/:tourId/edit`

Builder capabilities:

- assign or create/edit personas (saved persona library)
- edit tour title and description
- add/remove/reorder **features** (chapters)
- per feature: edit title and description
- **link demos** — pick saved documents from the library; reorder demos within a feature
- set tour status: **Draft** or **Live**
- configure completion CTA
- live overview canvas showing tour structure
- auto-save
- preview tour (opens learner view)
- share tour link and export tour PDF from header

Legacy **RouteHub** routes (`/routes/...`) redirect to the product tour equivalents; existing routes can auto-migrate to tours.

#### Tour learner (playback)

Route: `/tours/:tourId`

Guided playback progresses through structured segments:

1. **Persona intro** — introduces the buyer persona (avatar, name, role)
2. **Tour details** — tour title and description
3. For each feature:
   - **Feature intro** — chapter title and context
   - For each linked demo:
     - **Demo intro** — demo label and source document info
     - **Demo steps** — plays the document's steps (respects sections; branches show branch panels)
     - **Demo branches** — inline branch path selection within a linked demo
4. **Complete** — summary with optional CTA button

Navigation:

- previous/next controls and keyboard arrows
- estimated duration calculated from step counts
- **Presenter mode** (`?presenter=1`) — cleaner chrome for live demos; share modal can copy presenter links

Product tours inherit branching behavior from linked documents — a demo that contains branch points pauses for path selection during tour playback.

#### Product tour sharing

- readonly/editable share links
- presenter link option for live storytelling
- PDF export of the full tour narrative

---

### PDF export

Available from document and tour share flows:

- multi-page PDF with step screenshots
- click/input markers rendered on screenshots where supported
- branch path selection for branched documents (choose which paths to include)
- product tour PDF export covers the tour structure and demo content

---

### Browser extension (summary)

| Capability | Details |
|------------|---------|
| Toolbar popup | Branded UI, live status, recording controls |
| Recording | Start (with countdown), pause, resume, stop-and-open-editor |
| Event capture | Content script on all pages; navigation tracking |
| Screenshots | Background worker capture; visible, selection, full-page modes |
| Handoff | Opens app editor tab; transfers payload + screenshot blobs |
| Shortcuts | Open dashboard, open editor |
| Quick screenshots | Hidden while recording is active |

---

## Architecture summary

### Monorepo structure

- `packages/extension` — browser extension (popup, content script, background worker, capture tool)
- `packages/app` — React web app (dashboard, editor, player, compare, tours, capture editor)
- `packages/shared` — shared types, event model, step descriptions, coordinate utilities

### Shared package

The shared package provides:

- event and outline types (`FlowStep`, `FlowSection`, `FlowBranch`)
- handoff message types
- coordinate utilities and selector/xpath helpers
- masking helpers for sensitive values
- step description generation
- flow step creation and manual outline item factories

This keeps the extension and web app aligned around a single recording schema.

### App routes

| Route | Purpose |
|-------|---------|
| `/` | Dashboard |
| `/landing` | Marketing landing (empty library redirect) |
| `/editor` | New recording handoff editor |
| `/docs/:documentId` | Shared doc/player view |
| `/docs/:documentId/edit` | Saved document editor |
| `/compare` | Compare two documents |
| `/tours/new` | Create product tour |
| `/tours/:tourId/edit` | Product tour builder |
| `/tours/:tourId` | Product tour learner |
| `/capture/:captureId/edit` | Standalone screenshot editor |

### Extension responsibilities

- capture browser interactions
- store temporary recording data and screenshot blobs
- manage recording state
- capture screenshots (inline and quick modes)
- build the handoff payload
- open the editor tab

### App responsibilities

- hydrate the handoff payload and save documents
- render dashboard, editor, player, compare, tour, and capture editor views
- manage local library (documents, tours, personas)
- export PDF
- generate share links

---

## Customer value proposition

Peacock turns product activity into customer-facing documentation with almost no friction.

### Primary benefits

- **Faster documentation** — document workflows by doing them once
- **Better product demos** — recordings become guided walkthroughs and tour assets
- **Better onboarding and training** — repeatable SOPs and enablement content
- **Better customer support** — turn fix steps into reusable guides
- **Better product marketing** — persona-led tours from real product journeys
- **Release confidence** — compare docs side by side after UI or flow changes

### Why customers care

- reduces manual screenshot-and-write work
- keeps screenshots and action descriptions in sync
- supports branching decision trees without duplicating content
- produces consistent documentation across teams
- local-first default for speed and privacy

---

## Ideal target users

- product marketing teams
- customer success teams
- solutions and sales engineers
- support teams
- operations and enablement teams
- SaaS founders demonstrating workflows

---

## Example use cases

### Customer onboarding guide

Record setup once, add sections, clean up steps, export PDF, share a hosted player link.

### Internal SOP with branches

Record the happy path, link alternate admin and member paths as branches, share one guide with path selection.

### Persona-led sales demo

Build a product tour for "VP Engineering" with feature chapters (Security, Integrations, Analytics), each linking to recorded demos; present with presenter mode.

### Support macro content

Reproduce a fix, save the flow, share the player link instead of rewriting instructions.

### Workflow regression comparison

Save docs before and after a release; open Compare Docs to walk through both step by step.

### Redacted support screenshot

Capture full page from extension, open Capture Editor, redact customer data, download polished image.

---

## Differentiators

Compared with manual screenshot docs or generic screen recorders:

- captures structured interaction data, not just video
- produces editable steps with auto-generated language
- couples screenshots with the exact user action and click markers
- multiple screenshot workflows (inline, quick capture, step replacement, capture editor)
- branching across documents without duplication
- persona-led product tours from the same library
- document and player modes from one share URL
- side-by-side compare for release review
- local-first by default

---

## Current limitations

- storage is browser-local, not team-shared cloud storage
- share links point to documents on the current app instance/origin
- compare mode aligns by step index, not semantic diffing
- embed sharing is planned but not implemented
- step descriptions use deterministic rules, not AI rewrite
- Chrome extension requires rebuild/reload when env values change
- `localhost` and production are separate storage environments

---

## Recommended positioning statement

Peacock Studio is a browser flow capture and documentation platform that converts real product usage into editable walkthroughs, branching guides, persona-led product tours, comparable doc pairs, and exportable SOPs in minutes.

---

## Short pitch

Peacock helps teams record a workflow once and instantly turn it into a polished customer-facing guide, internal SOP, branching demo, or product tour — complete with screenshots, structured steps, playback, export, and sharing.

---

## Suggested roadmap themes

- cloud-backed persistence and team workspaces
- comments and collaboration
- embed widgets for share modal
- semantic diffing and smarter compare workflows
- reusable templates
- analytics on viewed/shared flows
- deeper redaction and compliance tooling
- AI-assisted rewrite and summarization of steps
- multi-product libraries and categorization

---

## One-line summary for AI assistants

Peacock Studio is a browser extension + React app that captures browser actions and screenshots (multiple modes), converts them into editable documentation steps with sections and branching, bundles docs into persona-led product tours, and lets users compare, play, export, and share those flows — all stored locally in IndexedDB.
