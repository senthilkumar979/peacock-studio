# Peacock Studio — Product Bible

> **Purpose of this document:** Canonical product reference for pitch decks, landing pages, store listings, sales enablement, and AI-assisted copy generation. Describes what Peacock Studio is, what it does today, who it serves, and how to talk about it accurately.

---

## Table of contents

1. [Executive summary](#executive-summary)
2. [The problem we solve](#the-problem-we-solve)
3. [The Peacock solution](#the-peacock-solution)
4. [Core workflow](#core-workflow)
5. [Product architecture](#product-architecture)
6. [Browser extension](#browser-extension)
7. [Capture Editor (standalone screenshots)](#capture-editor-standalone-screenshots)
8. [Flow editor (documentation builder)](#flow-editor-documentation-builder)
9. [Document metadata: version & capture environment](#document-metadata-version--capture-environment)
10. [Branching documents](#branching-documents)
11. [Document view (read mode)](#document-view-read-mode)
12. [Player (guided playback)](#player-guided-playback)
13. [Dashboard & library](#dashboard--library)
14. [Share, links & PDF export](#share-links--pdf-export)
15. [Product tours](#product-tours)
16. [Compare Docs](#compare-docs)
17. [Privacy & safety](#privacy--safety)
18. [Technical architecture](#technical-architecture)
19. [Route reference](#route-reference)
20. [Messaging toolkit (pitch & landing)](#messaging-toolkit-pitch--landing)
21. [Use cases by team](#use-cases-by-team)
22. [Differentiators](#differentiators)
23. [Limitations & honest boundaries](#limitations--honest-boundaries)
24. [Roadmap themes](#roadmap-themes)
25. [Glossary](#glossary)

---

## Executive summary

**Peacock Studio** is a browser-based flow capture and documentation platform. It turns real product usage on live websites into polished, reusable assets: step-by-step guides, SOPs, branching demos, persona-led product tours, PDFs, and shareable walkthrough links.

The product has two parts:

| Part | Role |
|------|------|
| **Browser extension** (Chrome / Edge) | Records clicks, inputs, navigation, and screenshots on any website |
| **Web app** (React) | Edits recordings into structured documentation, plays them back, bundles them into tours, exports PDFs, and compares versions |

**One-line pitch:** Record a workflow once — get an editable guide with screenshots, branching paths, and a shareable player in minutes.

**Positioning statement:** Peacock Studio converts real browser activity into customer-facing documentation, internal SOPs, branching decision guides, and persona-led product tours — without rebuilding screenshots and copy from scratch.

**What Peacock is not (today):** Not a video screen recorder. Not an AI writing tool. Not a cloud CMS. Not a team workspace with accounts. It is **local-first**, **action-aware**, and **structured**.

---

## The problem we solve

Teams document product workflows constantly — for sales demos, onboarding, support, QA, and release notes. The manual approach fails in predictable ways:

| Pain | Manual approach | With Peacock |
|------|-----------------|--------------|
| **Time** | Hours of screenshots + writing per guide | Minutes from one live recording |
| **Drift** | Docs fall out of sync with the product | Re-record and compare side by side |
| **Consistency** | Every presenter tells a different story | Same structured narrative every time |
| **Branching** | Separate videos or docs per path | One guide with selectable paths |
| **Persona fit** | Generic decks for every audience | Persona-led tours with feature chapters |
| **Privacy** | Sensitive data in screenshots | Redact/blur tools + field exclusions |
| **Distribution** | Scattered files and drives | Links, PDF, and presenter mode |

---

## The Peacock solution

Peacock captures **structured interaction data** (not just pixels): what was clicked, what was typed, where on the page, and a screenshot at that moment. The web app turns that into:

- **Editable steps** with auto-generated titles and optional notes
- **Sections** (chapters) for long guides
- **Branches** that link to other saved documents without duplicating content
- **Document view** for reading and **Player view** for guided step-through
- **Product tours** that chain multiple demos under a buyer persona
- **PDF export** and **share links** for distribution
- **Compare Docs** for before/after or release review

Everything persists **locally in the browser** (IndexedDB) — fast, private, no account required.

---

## Core workflow

### Step 1 — Install & record

1. Install the Peacock browser extension.
2. Navigate to any website.
3. Click **Start** in the popup (optional 3-2-1 countdown).
4. Perform the workflow — clicks, form fills, navigation.
5. Extension captures events + screenshots in sync.

### Step 2 — Edit & structure

1. Click **Stop and open editor** — app opens in a new tab.
2. Recording handoff hydrates the flow editor; document auto-saves to IndexedDB.
3. **Flow details drawer** prompts for title, description, and version (once per session).
4. Refine steps, add sections/chapters, link branch paths, replace screenshots, add blur/redact via Capture Editor if needed.
5. Auto-save keeps work safe as you edit.

### Step 3 — Tour & share

1. Open **Doc view** for reading or **Player** for guided playback.
2. Copy a **share link** (readonly or editable) or **export PDF**.
3. Optionally bundle demos into a **product tour** with persona and presenter mode.
4. Use **Compare Docs** when reviewing UI or flow changes across releases.

---

## Product architecture

```
┌─────────────────────┐         handoff          ┌──────────────────────────────┐
│  Browser extension  │ ───────────────────────► │  Peacock web app             │
│  · content script   │   payload + screenshots  │  · dashboard                 │
│  · background worker│                          │  · flow editor               │
│  · popup UI         │                          │  · document / player views   │
│  · IndexedDB (temp) │                          │  · product tour builder      │
└─────────────────────┘                          │  · capture editor            │
         │                                       │  · compare docs              │
         │ quick screenshots                     │  · IndexedDB (library)       │
         └──────────────────────────────────────►└──────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │  @peacock/shared  │
                    │  types, events,   │
                    │  step language,   │
                    │  coordinates      │
                    └───────────────────┘
```

**Monorepo packages:**

| Package | Responsibility |
|---------|----------------|
| `packages/extension` | Recording, screenshots, popup, handoff bridge |
| `packages/app` | Dashboard, editor, player, tours, PDF, compare, capture editor |
| `packages/shared` | Shared TypeScript types, event model, utilities |

---

## Browser extension

### Popup capabilities

- **Recording controls:** Start (with countdown), Pause, Resume, Stop and open editor
- **Live session feedback:** Status badge, step count, elapsed time, current domain
- **Quick navigation:** Open dashboard, open editor
- **Quick screenshots** (when not recording): Visible area, Selection, Full page

### Recording behavior

| Behavior | Detail |
|----------|--------|
| Event types | Clicks, debounced inputs (400ms), navigation (SPA-aware), page views |
| Screenshots | Pointer-down pre-capture on clicks; debounced on inputs; page view on load/stop |
| UI exclusion | Peacock's own UI hidden during screenshot capture |
| Password fields | Never captured in element snapshots |
| Sensitive URLs | Auto-pause on URL patterns matching login, payment, billing |
| Stop flow | Final screenshot → page snapshot → open `/editor` → handoff via bridge |

### Capture environment (session metadata)

Recorded **once per session** when recording stops. Stored in flow metadata and shown in document intro, player intro, and PDF (when complete).

| Field group | Examples |
|-------------|----------|
| System | OS name/version, browser name/version, platform |
| Display | Screen size, viewport, available area, device pixel ratio |
| Locale | Language, timezone |
| Session | Recording start/end, duration |
| Raw | Full user agent string |

Parsed deterministically from `navigator` APIs — not editable after capture.

### Screenshot capture modes

#### During recording (automatic)

Screenshots tie to interaction steps. Stored as blobs in extension IndexedDB, transferred on handoff.

#### Quick capture (extension popup, idle only)

| Mode | Behavior |
|------|----------|
| **Visible area** | Current viewport |
| **Selection** | User draws rectangle; overlay excluded from result |
| **Full page** | Scroll-and-stitch with sticky header/footer suppression, widget suppression, scroll restore |

Quick captures open a result page (download/copy) and can open **Capture Editor** at `/capture/:captureId/edit`.

---

## Capture Editor (standalone screenshots)

**Route:** `/capture/:captureId/edit`

Polish marketing- or support-ready images outside of a full flow recording.

### Tools

| Tool | Purpose |
|------|---------|
| **Select** | Default mode after other tools finish. Click blur/redact regions to select; drag to move; corner/edge handles to resize; **Delete** removes selected region |
| **Crop** | Drag to select crop area; **applies automatically on mouse release**; switches back to Select |
| **Blur** | Draw privacy region; adjustable intensity (4–24) in sidebar when selected |
| **Redact** | Draw region; soft white overlay hides underlying content |

### Caption & layout

| Setting | Range / detail |
|---------|----------------|
| **Title & description** | Rendered above screenshot (outside image frame) |
| **Background presets** | 15 gradients/solids (Rose gold default) — see list below |
| **Padding** | 0–200px |
| **Image corner radius** | 0–48px (screenshot card) |
| **Frame corner radius** | 0–96px (gradient frame; transparent corners on export) |
| **Light caption text** | White title/description on dark presets (Charcoal, Peacock bold, Ocean, Aurora, Forest, Ember, Midnight, Studio dark) |

### Background presets (active)

Charcoal · Peacock soft · Peacock bold · Ocean · Aurora · Sunrise · Citrus · Forest · Ember · Midnight · Studio dark · Silver · Rose gold · Mesh blue · Mesh warm

### History & export

- Undo/redo (30 states)
- **Download PNG** or **Copy to clipboard**
- Privacy regions use normalized coordinates (0–1) for correct scaling

---

## Flow editor (documentation builder)

**Routes:** `/editor` (new handoff) · `/docs/:documentId/edit` (saved document)

### Layout

Three columns: **Outline** (280px) | **Canvas preview** | **Detail panel** (320px)

### Outline capabilities

- Drag-and-drop reorder (steps, sections, branches)
- **Add step** — manual step with placeholder screenshot
- **Add section** — chapter divider (title + description)
- **Create a branching point** — link paths from other saved documents
- Auto-scroll selected item into view

### Step editing (Step panel)

- Edit title and notes (blank notes → auto-generated description shown)
- Upload/replace screenshot (JPEG, PNG, SVG); reset to captured original
- View auto-generated description (read-only reference)
- Canvas preview with click marker
- Delete step (confirmation dialog)

### Section editing (Section panel)

Sections divide a flow into **chapters**. They appear in document view, player (as chapter intro cards), and PDF context — not as interactive steps.

- Edit title and description
- Info tooltip explains section purpose
- Delete section (confirmation — steps below are kept)

### Branch editing (Branch panel)

- Edit branch title, description, layout (list vs grid for 4+ paths)
- Add paths via modal: pick target document, step range, path label
- Remove path or delete branch (confirmation dialogs with highlighted names)
- Info tooltip explains branch points

### Flow details drawer

Slides in from the right on first editor open (once per session per recording). Fields:

| Field | Required | Appears in |
|-------|----------|------------|
| **Title** | Yes | Library, doc header, PDF cover, share |
| **Description** | No | Doc intro, PDF cover |
| **Version** | No | Library (badge), doc intro, PDF cover, searchable in dashboard |

Version is free-form (e.g. `1.0.0`, `2026.1.0`, `v1.2.0-g4b2d9e1`). Empty version shows **Unversioned** badge.

Re-open anytime via **Flow details** in toolbar.

### Toolbar actions

- Step count display
- **Flow details** — reopen metadata drawer
- **Play** — opens player at `/docs/:id?view=player`
- Header **Share** and PDF export

### Auto-save

Documents persist to IndexedDB with debounced auto-save (~1.5s) once a document ID exists.

---

## Document metadata: version & capture environment

### Version

Tracks release or iteration of a guide (e.g. after UI refresh). Visible in:

- Dashboard library (table, card, list views) via version badge
- Document & player intro (`FlowVersionBadge`)
- PDF cover page
- Branch-linking modals when picking target documents
- Dashboard search (title, description, **or version**)

### Capture environment

One-time snapshot of browser/device at recording time. Displayed in:

- **Document view** — `FlowDetailsIntro` + `CaptureEnvironmentPanel`
- **Player** — intro segment before steps
- **PDF export** — dedicated session metadata page (when data is complete)

Highlights: OS, browser, capture duration. Detail groups: system, display, locale. Full user agent string included.

**Not shown in Flow details drawer** (read-only metadata from recording).

---

## Branching documents

Branching lets one document present **multiple paths** at a decision point without duplicating target content.

### Setup

1. **Create a branching point** in outline.
2. Pick a **target saved document** (host document excluded).
3. Choose **step range** within target (`fromStepId` → `toStepId`).
4. Set **path label** (e.g. "Admin setup", "Member setup").
5. Repeat for additional paths on the same branch.

### Presentation

| Surface | Behavior |
|---------|----------|
| **Document view** | Branch card with path picker; linked steps inline with accent colors |
| **Player** | Branch choice panel (list or grid); keyboard path selection |
| **PDF** | Branch highlight page + steps from selected paths only |
| **Share links** | Readonly links can filter visible paths via URL params |

### Share URL branch filtering

Readonly doc URLs support query params:

- `?paths=pathId1,pathId2` — include specific paths
- `?branches=branchId1` — include specific branches

Settings saved on link copy for readonly shares.

---

## Document view (read mode)

**Route:** `/docs/:documentId` (default; toggle Player in header)

Long-form, scrollable documentation optimized for reading and reference.

### Layout (large screens)

Fixed two-column: **outline sidebar** (~22rem) + **scrollable content**.

### Flow intro

Title, description, version badge, step count, created date, capture environment panel.

### Content structure

- **Section cards** — chapter headings with description
- **Step cards** — screenshot, title, notes, click marker, copy-link button
- **Branch cards** — branch title/description, path selection
- **Linked path steps** — indented under branch with path-specific accent colors (8-color palette)

### Outline sidebar

- Flow overview, sections, steps, branches, linked-path groups
- **Scroll spy** — active item follows scroll position
- Click navigates content pane and updates URL hash
- Branch with single path labeled **Automatically chosen path**

### Deep linking

| Anchor pattern | Target |
|----------------|--------|
| `#flow-details` | Intro section |
| `#step-{stepId}` | Main flow step |
| `#linked-{pathId}-{stepId}` | Linked path step |

**Copy link** on each step copies current doc URL with anchor.

### Header actions

Toggle Doc/Player, Share, PDF export, Edit (if editable link).

---

## Player (guided playback)

**Route:** `/docs/:documentId?view=player`

Focused, step-by-step playback with browser mockup framing — ideal for demos, onboarding walkthroughs, and self-serve exploration.

### Playback segments

Intro → **section chapter cards** → steps → **branch choice panels** → linked path steps → **finale**

### Section behavior in player

When playback reaches a section, a full **chapter intro card** appears with title and description. User presses **Next** or **→** to enter that chapter's steps. Sections are **not skipped** — they frame the narrative.

### Branch behavior

- First path **pre-selected** per branch
- **FlowBranchChoicePanel:** list or grid layout
- **→ / Enter** — start selected path
- **↑ / ↓** or **1–N** — change path selection before continuing
- Linked document steps play inline, then return to host flow

### Controls & keyboard

| Input | Action |
|-------|--------|
| **← / →** | Previous / next segment |
| **Space** | Toggle autoplay (~2.5s per segment) |
| At branch | **↑↓**, **1–N**, **Enter**, **→** |

Autoplay pauses at branches, linked playback transitions, and finale.

### Finale

Summary screen with step, section, and branch counts; option to replay.

### Player intro

Same metadata as document view: title, description, version, capture environment.

---

## Dashboard & library

**Route:** `/` (redirects to `/landing` when library is empty)

### Stats bar

| Stat | Meaning |
|------|---------|
| Total documentations | All saved docs |
| Created this week | Docs recorded this calendar week |
| Created this month | Docs recorded this calendar month |
| Steps documented | Sum of playable steps |
| Avg steps per doc | Mean step count |

### Your documentations

| Capability | Detail |
|------------|--------|
| **View modes** | Table (default), Cards, List — persisted in localStorage |
| **Search** | Expandable search icon; matches title, description, version |
| **Sort** | Newest, oldest, most steps, title A–Z |
| **Version badge** | Violet tag or "Unversioned" dashed badge |
| **Per-doc actions** | Play, Edit, Share, Delete (confirm with step count) |
| **Compare** | Link to `/compare` |

Table columns: Title (with step count), Version, Generated date, Actions — each with icon headers.

### Product tours section

Separate from single docs. Create tour → `/tours/new`. Tour cards: edit, play, share, delete (confirm with feature/demo counts).

### Featured document

Highlights the most recently updated documentation.

---

## Share, links & PDF export

### Share modal methods

| Method | Status |
|--------|--------|
| **Link** | Readonly or editable URLs |
| **PDF** | Multi-page export with screenshots |
| **Embed** | Placeholder — "coming soon" |

### Document links

| Type | URL pattern |
|------|-------------|
| Readonly doc | `/docs/{id}` (+ optional branch query params) |
| Editable doc | `/docs/{id}/edit` |
| Player | `/docs/{id}?view=player` |
| Step anchor | `/docs/{id}#step-{stepId}` |

Branch path preferences for readonly links configurable in share modal; saved to document `shareSettings`.

### PDF export (documents)

- Cover page: title, description, version badge, step count, recorded date
- Session metadata page (when capture environment complete)
- Step pages: screenshot, title, instruction text, click marker
- Branch pages: branch title, selected path, other paths listed as excluded
- **Branch path selection** required when document has branches (one path per branch)
- **Blocking loader** during export — full-screen overlay prevents navigation until complete
- Downloads as `{sanitized-title}.pdf`

### PDF export (product tours)

Exports narrative across all linked demos in tour (when tour has exportable demos).

---

## Product tours

Product tours bundle **multiple saved documents** into a **persona-led**, multi-chapter guided experience — distinct from a single linear doc.

### Concepts

| Entity | Purpose |
|--------|---------|
| **Tour** | Container: title, description, draft/live status, completion CTA |
| **Persona** | Buyer/user role: name, title, company, avatar, descriptions |
| **Feature** | Chapter grouping demos |
| **Demo** | Reference to saved Peacock document, ordered within feature |
| **Completion CTA** | Optional button (label + URL) on final slide |

### Tour builder

**Routes:** `/tours/new` → `/tours/:tourId/edit`

#### Tour persona (first panel in builder)

Each tour is anchored to one **persona** — the buyer or user role the narrative speaks to.

| Capability | Detail |
|------------|--------|
| **Saved persona library** | All personas stored locally; reusable across tours |
| **Choose existing** | Chip picker lists every saved persona; click to assign to this tour |
| **Create new** | **New persona** opens a slide-in drawer (same pattern as flow details) |
| **Edit selected** | **Edit** opens the drawer pre-filled with current persona fields |
| **Persona fields** | Name, role, short description, detailed description, gender, avatar, company, tagline |
| **Default persona** | New tours start with “Product explorer” until changed |
| **Auto-assign on save** | Creating or editing a persona automatically selects it for the tour |

#### Other builder capabilities

- Add/reorder features and link demos from library
- Live overview canvas showing tour structure
- Draft / Live status
- Completion CTA (optional label + URL on final slide)
- Auto-save, preview learner, share, PDF export

### Tour learner (playback)

**Route:** `/tours/:tourId`

Segment flow:

1. Persona intro
2. Tour details (estimated duration)
3. For each feature: feature intro → for each demo: demo intro → demo steps (with inline branches) → complete panel

Navigation: prev/next, keyboard arrows. Inherits branching from linked documents.

### Presenter mode

**Route:** `/tours/:tourId?presenter=1`

- Hides app chrome, sidebar overview, footer controls
- Share modal can generate presenter links
- Optimized for live storytelling on calls

### Legacy routes

`/routes/*` redirects to equivalent `/tours/*`. Old routes auto-migrate to tours in IndexedDB.

---

## Compare Docs

**Route:** `/compare`

Side-by-side review of two saved documents.

| Capability | Detail |
|------------|--------|
| Document pickers | Left and right from library |
| Navigation | Shared step index; Previous/Next; keyboard arrows |
| Alignment | By **step index**, not semantic diff |
| Short doc handling | Empty pane when one doc has fewer steps |

**Best for:** Release review, UI regression checks, before/after workflow comparison — not automated visual diff.

---

## Privacy & safety

| Mechanism | Where |
|-----------|-------|
| Password field exclusion | Extension recording |
| Peacock UI exclusion | Extension recording |
| Sensitive URL auto-pause | Extension (login/payment/billing patterns) |
| Blur regions | Capture Editor, exportable |
| Redact regions | Capture Editor, exportable |
| Local-only storage | IndexedDB on device — no cloud upload by default |
| Normalized coordinates | Markers/regions scale correctly on resize |

---

## Technical architecture

### Shared package (`@peacock/shared`)

- Event types: `click`, `input`, `navigation`, `page-view`
- Outline types: `FlowStep`, `FlowSection`, `FlowBranch`, `LinkedPeacockPath`
- Capture types: editor settings, background presets, capture environment
- Utilities: step description generation, element snapshots, normalized coordinates, branch helpers

### Step language (deterministic, not AI)

Generated from captured element metadata:

- `Click Save and Close`
- `Enter State: Tamil Nadu`
- `Select Country: India`
- `On the Order page, click the Save and Close button to save the form.`

Users override with custom titles and notes.

### Storage model

| Data | Location |
|------|----------|
| Documents, screenshots, tours, personas | App IndexedDB (`peacock-flow-library`) |
| In-flight recording | Extension IndexedDB |
| View preferences | localStorage (dashboard view mode) |
| Flow details prompt | sessionStorage (once per recording) |

**Note:** `localhost` and production deployments use **separate** IndexedDB databases.

### Handoff bridge

Extension opens app tab → app requests pending handoff → extension delivers payload + screenshot blob URLs → app saves document.

---

## Route reference

| Route | Purpose |
|-------|---------|
| `/` | Dashboard |
| `/landing` | Marketing landing (empty library redirect) |
| `/editor` | New recording editor (handoff) |
| `/docs/:documentId` | Document view |
| `/docs/:documentId?view=player` | Player |
| `/docs/:documentId/edit` | Flow editor |
| `/compare` | Compare two documents |
| `/capture/:captureId/edit` | Capture Editor |
| `/tours/new` | Create product tour |
| `/tours/:tourId/edit` | Tour builder |
| `/tours/:tourId` | Tour learner |
| `/tours/:tourId?presenter=1` | Presenter mode |

---

## Messaging toolkit (pitch & landing)

Use these blocks directly or adapt for decks, hero sections, and ads.

### Hero headline options

1. **Turn real product usage into polished documentation — in minutes.**
2. **Record once. Guide forever.**
3. **The fastest path from live workflow to shareable product guide.**
4. **Stop rebuilding screenshots. Start recording workflows.**

### Hero subhead options

- Peacock captures clicks, inputs, and screenshots from any website, then turns them into editable step-by-step guides with branching paths, PDF export, and persona-led product tours.
- From browser extension to shareable player — no manual screenshot assembly, no generic screen recording.

### Three-step workflow (landing)

| Step | Title | Copy |
|------|-------|------|
| 01 | Install & record | Pin the Peacock Chrome extension and record a real workflow on any site. |
| 02 | Edit & structure | Refine steps, add sections and branches, attach screenshots, and auto-save locally. |
| 03 | Tour & share | Bundle demos into persona-led tours, then share links, export PDFs, or present live. |

### Feature pillars (landing cards)

| Pillar | Explanation | Benefit | Impact |
|--------|-------------|---------|--------|
| Chrome extension capture | Record clicks, inputs, navigation, screenshots from any website | Structured steps without manual screenshot work | Cut documentation prep from hours to minutes |
| Flow editor with branches | Reorder steps, sections, link paths to other docs | Complex workflows in one guide | Replace Loom + doc + slide deck fragmentation |
| Persona-led product tours | Multiple demos in feature chapters for a buyer persona | Focused story per audience | Better demo relevance for sales & enablement |
| Interactive player | Step-through, autoplay, keyboard nav, branch selection | Self-serve exploration | Comprehension without another live call |
| Share links & PDF | Readonly/editable links, printable guides | Same asset across email, calls, teams | Scale best walkthrough without repeating live |
| Capture editor & compare | Polish screenshots; compare two docs side by side | Release notes, redacted support artifacts | Keep docs accurate as product evolves |

### Comparison table (vs manual docs)

| Dimension | Manual documentation | Peacock Studio |
|-----------|---------------------|----------------|
| Setup time | Hours per guide | Minutes from recording |
| Consistency | Varies by presenter | Same narrative every time |
| Branching | Separate videos or docs | Built-in path selection |
| Persona targeting | Custom decks per role | Structured product tours |
| Data control | Scattered files & drives | Local-first on device |
| Screenshot sync | Manual paste & crop | Captured with each action |
| Release review | Side-by-side guesswork | Compare Docs by step index |

### Architecture trust points

- **Local-first storage** — Documents, tours, personas on device; no cloud required
- **Shared type system** — Extension and app use one event model
- **Privacy by design** — Password exclusion, URL guardrails, redaction tools
- **Normalized coordinates** — Click markers stay accurate at any size

### FAQ (approved answers)

**What is Peacock Studio?**  
A browser flow capture and documentation platform that converts real product usage into editable walkthroughs, shareable demos, and persona-led product tours.

**Do I need a backend or account?**  
No. Local-first workflow — library stored in browser IndexedDB on this device.

**Can I share with team or customers?**  
Yes — copy shareable links (readonly or editable) and export PDFs for documents and tours. Embed widgets planned, not yet available.

**How do product tours differ from single documents?**  
Tours combine multiple saved demos into feature chapters anchored to a persona, with guided playback and presenter mode.

**Does Peacock use AI?**  
Not today. Step titles/descriptions use deterministic rules from captured element metadata. AI-assisted rewrite is on the roadmap.

**Who is this built for?**  
Product marketing, sales engineering, customer success, support, and enablement teams who need repeatable, high-quality product storytelling.

### Automation highlights (sales copy)

- **Auto step descriptions** — Clicks and inputs become readable titles
- **Auto-save library** — Documents and tours persist as you edit
- **Sensitive URL guardrails** — Recording pauses on login/payment/billing patterns
- **Presenter-ready tours** — Clean presenter link hides chrome for live demos
- **Capture environment** — Browser/device metadata captured once per recording
- **Version tracking** — Label docs by release for library search and PDF export

### Pitch lengths

**30 seconds:**  
Peacock records your real browser workflow and instantly turns it into an editable guide — screenshots, steps, click markers, and all. Add branches for different user paths, bundle demos into persona-led tours, and share a player link or PDF. No manual screenshot work. Local-first and private.

**2 minutes:**  
Every team documents product workflows — for sales, onboarding, support, and QA. Today that's hours of screenshots and writing that goes stale after the next release. Peacock is a Chrome extension plus web app that records what you actually do on a live website: clicks, inputs, navigation, and screenshots in sync. The app turns that into structured, editable steps with auto-generated language you can refine. Add chapter sections for long guides. Link branch paths to other saved docs so one guide covers admin vs member flows without duplication. Share a readonly link or export PDF. Build persona-led product tours for VP Engineering vs Customer Success. Compare two saved docs side by side after a UI refresh. Everything stays local in your browser — fast, no account required. Peacock is for teams who need repeatable product storytelling without rebuilding docs from scratch every quarter.

**Investor angle:**  
Peacock sits at the intersection of product-led growth tooling and documentation automation. The extension creates proprietary structured event data (not video), enabling editable guides, branching, tours, and comparison workflows competitors can't easily replicate with screen recorders. Local-first reduces friction for individual adoption; cloud/team layer is natural expansion. Market: every B2B SaaS team documents workflows — TAM scales with seat expansion and team workspaces.

---

## Use cases by team

### Product marketing

- Record feature walkthrough once → publish player link on website
- Build persona-led tour for enterprise vs SMB buyers
- Export PDF for sales leave-behind
- Version docs per release (`2.1.0`, `2026-Q1`)

### Sales engineering

- Live demo backup when prospect explores async
- Branching guide for setup vs evaluation paths
- Presenter mode on discovery calls
- Compare doc before/after pricing page change

### Customer success & onboarding

- Chapter sections for phased onboarding
- Player autoplay for webinar walkthrough
- Share readonly link in welcome email
- Redact customer data in Capture Editor for support articles

### Support

- Reproduce fix once → share player link instead of rewriting steps
- Full-page capture + redact for help center images
- Branch paths for different product tiers or OS setups

### Enablement & operations

- Internal SOPs with sections and branches
- QA regression: save doc before release, compare after
- Library search by version to find latest guide

### Founders & small teams

- No account setup — install extension, record, share
- One person maintains library locally until team cloud ships

---

## Differentiators

Compared with manual docs, Loom/video, and generic screenshot tools:

1. **Structured actions, not video** — Editable steps, not a timeline to re-record
2. **Screenshot + action coupling** — Image and instruction always in sync
3. **Auto-generated step language** — From DOM context, instantly readable
4. **Branching without duplication** — Link paths across documents
5. **Dual consumption modes** — Same URL: read (doc) or play (player)
6. **Persona-led tours** — Multi-demo narratives from one library
7. **Compare workspace** — Side-by-side step review
8. **Capture Editor** — Marketing-grade screenshot polish with privacy tools
9. **Local-first** — Fast, private, no account friction
10. **Session metadata** — Capture environment for audit and context
11. **Version labels** — Track iterations in library and PDF

---

## Limitations & honest boundaries

| Limitation | Detail |
|------------|--------|
| **No cloud sync** | Data is browser-local; no team library across devices |
| **Share links are URL-based** | Editable links open editor for anyone with URL on same origin |
| **No embed widgets yet** | Share modal shows placeholder |
| **No AI writing** | Deterministic step language only |
| **Compare is index-based** | Not semantic or visual diff |
| **Chrome extension env** | Rebuild/reload when env values change |
| **Separate storage per origin** | localhost ≠ production library |
| **Cross-device sharing** | Recipient needs hosted deployment + same doc IDs for true remote share (future cloud) |

Be transparent in marketing: Peacock excels at **speed, structure, and local privacy** today; **collaboration and cloud** are the natural next chapter.

---

## Roadmap themes

- Cloud-backed persistence and team workspaces
- Real access control and authenticated sharing
- Embed widgets for docs and tours
- Semantic diff and smarter compare
- Reusable templates and doc categories
- Analytics on viewed/shared flows
- AI-assisted rewrite and summarization
- Deeper compliance (PII detection, retention policies)
- Multi-browser extension support

---

## Glossary

| Term | Definition |
|------|------------|
| **Document / flow / doc** | A saved recording with steps, sections, and optional branches |
| **Step** | Single interaction unit: screenshot, title, marker, notes |
| **Section** | Chapter divider; intro card in player, heading in doc |
| **Branch** | Decision point with multiple linked paths |
| **Path** | Link from branch to step range in another document |
| **Player** | Guided step-through playback mode |
| **Document view** | Scrollable read mode with outline |
| **Product tour** | Multi-demo, persona-led narrative |
| **Persona** | Buyer/user role anchoring a tour |
| **Feature** | Tour chapter containing linked demos |
| **Demo** | Tour reference to a saved document |
| **Capture Editor** | Standalone screenshot polish tool |
| **Handoff** | Extension → app payload transfer on stop recording |
| **Capture environment** | One-time browser/device metadata per recording |
| **Normalized coordinates** | 0–1 floats for markers and regions (not pixels) |

---

## One-line summary for AI assistants

Peacock Studio is a browser extension + React app that captures browser actions and screenshots (recording and quick modes), converts them into editable documentation with sections, branching, and version labels, bundles docs into persona-led product tours, and supports document/player views, PDF export, share links, capture environment metadata, and side-by-side compare — stored locally in IndexedDB.
