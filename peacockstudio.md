# Peacock Studio — Marketing Product Bible

> **Purpose:** Ground truth for social posts, ads, and AI-assisted copy/image generation. Prefer this file over legacy build notes (`peacock.md`) or outdated limitation rows in older docs when facts conflict with shipping marketing copy.
>
> **Product origin:** https://peacockstudio.app

---

## How to use this file (Cursor → external AI → manual post)

**Daily cadence:** at least **2 posts/day** — **FN** (forenoon) and **AN** (afternoon).

1. Ask Cursor in this repo: `FN prompt` or `AN prompt` (optionally `Day N FN` / `Day N AN`).
2. Cursor returns a **paste-ready generation prompt** for one feature angle (rotated via the theme list below).
3. In OpenAI, Gemini, or your preferred AI, paste **this entire `peacockstudio.md`** plus that prompt.
4. That AI outputs **hook + captions + image** (or image brief + generated image).
5. You post **manually** to the LinkedIn Company Page and X.

Cursor does **not** call LinkedIn/X APIs and does **not** generate the final social image inside the Peacock app.

---

## 1. What Peacock Studio is / is not

**Is:** A browser flow capture and documentation platform. It converts real product usage into editable walkthroughs, shareable demos, and persona-led product tours.

**Is not (today):**

- Not a video screen recorder (structured steps, not a Loom timeline)
- Not an AI writing tool (step titles/descriptions are deterministic from DOM metadata; AI rewrite is roadmap only)
- Not a replacement for Confluence / Notion / SharePoint (complements the wiki with visual, capture-native guides)

---

## 2. Elevator pitch & category

**Category line:** The system of record for how work actually happens.

**Positioning cue:** Structured workflow capture — not screen recording.

**One-liner:** Record a workflow once — get an editable guide with screenshots, branching paths, and a shareable player in minutes.

**~30s pitch:** Peacock records your real browser workflow and turns it into an editable guide — screenshots, steps, click markers, and all. Add branches for different user paths, bundle demos into persona-led tours, and share a player link, embed, or PDF. Guest-local to start; sign in for cloud sync and team sharing.

**Supporting description:** Peacock transforms real workflows into reusable execution guides and narrative experiences, helping teams align faster, enable others consistently, and preserve operational knowledge as products evolve.

---

## 3. Core products

### Flow Documents

Execution-grade guides from real product usage.

- Step-by-step guides with screenshots, sections, branches, and share links
- Ideal for: QA & regression, support playbooks, internal SOPs, release validation
- Same asset opens as **document view** (scrollable) or **interactive player** (guided step-through)

### Product Tours

Adoption narratives composed from multiple demos.

- Persona-led journeys that bundle saved flow documents into feature chapters
- Ideal for: sales demos, customer onboarding, release storytelling, enablement
- Presenter-ready links for live calls; self-serve playback for async audiences

### Capture Screenshot & Editor

Polished screenshots without leaving the browser.

- Capture modes: visible region, selected region, or entire scrollable page (extension popup)
- Edit: crop, blur, redact, gradient backgrounds, title/description context
- Download or copy to clipboard for help articles, chat, and leave-behinds

---

## 4. Core workflow (capture → structure → play → distribute)

| Stage | What happens |
| ----- | ------------ |
| **01 Install & record** | Pin the Chrome extension; record clicks, inputs, navigation, and screenshots on any site |
| **02 Edit & structure** | Reorder steps, add sections/chapters, link branches, polish screenshots; auto-save |
| **03 Tour & share** | Publish Flow Documents and/or Product Tours; share links & embeds; export PDF; present live |

**Also in the library (secondary for hero claims; strong for QA/eng angles):** test cases, Playwright tests, flow maps.

---

## 5. Feature inventory (verified)

### Capture

- Chrome extension capture (clicks, inputs, navigation, screenshots)
- Capture screenshot (visible / selection / full page)
- Auto step descriptions (rule-based from element metadata — not LLM)

### Structure & edit

- Flow editor with branches (link paths to other saved documents)
- Sectioning / chapters in flow docs
- Persona-led product tour composition
- Version labels; capture-environment metadata

### Playback & views

- Interactive player (autoplay, keyboard nav, branch selection)
- Document view or Player view from the same saved flow
- Compare Docs (side-by-side, aligned by step index)

### Share & export

- Share links (readonly or editable; optional branch path filters on readonly)
- Embed player (iframe for Flow Documents and Product Tours)
- Export to PDF (cover, steps, branches, session metadata)
- Presenter-ready tour links

---

## 6. Personas & use cases

**Primary audiences (landing):** Product marketing, sales engineering, customer success, support, enablement.

**Role pages also speak to:** developers, testers, product owners, business analysts, helpdesk, new hires, executives, security/compliance.

| Team | Example outcomes |
| ---- | ---------------- |
| **Product marketing** | Feature walkthrough once → player link / PDF; persona tours; versioned release docs |
| **Sales engineering** | Async demo backup; branching eval paths; presenter mode |
| **CS / onboarding** | Phased chapters; welcome-email share links; redacted support assets |
| **Support** | Reproduce-once playbooks; help-center images from Capture Editor |
| **Enablement / ops** | SOPs; QA compare before/after release |
| **Founders / small teams** | Guest start, no account required to try |

---

## 7. Problem → Peacock framing

**Pains:**

- Documentation takes longer than the workflow itself (screenshot → caption → rebuild on UI change)
- Demos don’t scale (presenter variance; branching lost; persona stories in separate decks)
- Knowledge trapped in individuals (best demo never becomes a reusable asset)

**Cost of waiting:** slower onboarding, inconsistent sales narratives, support answering questions a good walkthrough would prevent.

**Vs manual approaches (approved comparison rows):**

| Dimension | Manual | Peacock |
| --------- | ------ | ------- |
| Setup time | Hours per guide | Minutes from recording |
| Consistency | Varies by presenter | Same narrative every time |
| Branching | Separate videos or docs | Built-in path selection |
| Persona targeting | Custom decks per role | Structured product tours |
| Data control | Scattered files & drives | Guest local + cloud workspaces |
| Screenshot sync | Manual paste & crop | Captured with each action |
| Release review | Side-by-side guesswork | Compare Docs by step index |

---

## 8. Differentiators

1. Structured actions, not video timelines
2. Screenshot + action coupling
3. Auto-generated step language from DOM context (deterministic)
4. Branching without duplication
5. Dual consumption: document view + player
6. Persona-led multi-demo tours
7. Compare Docs workspace
8. Capture Editor polish with privacy tools
9. Guest-local start; cloud sync when signed in
10. Session / environment metadata and version labels

**Vs Confluence / Notion / SharePoint:** native browser capture, auto visual guides, narrative tours, interactive experiences, sensitive-input protection — positioned as **complement**, not wiki replacement.

---

## 9. Privacy & trust

- Password fields excluded from capture
- Sensitive URL patterns can pause recording
- Capture Editor supports blur/redaction regions
- Click markers use normalized 0–1 coordinates (stable when images resize)
- Guest can try without an account (library in browser IndexedDB)
- Sign in unlocks cloud sync, team workspaces, and secure tokenized share links

---

## 10. Cloud & pricing (honest)

**Access model:** Limited guest library in-browser without an account. Sign in for cloud sync, team workspaces, secure shares, invites/roles.

**Status:** Public beta — free for early adopters.

| Tier | Price | Highlights |
| ---- | ----- | ---------- |
| **Free** | Free during beta | Unlimited local flows, PDF export, public share links, cloud sync within free limits, community support |
| **Team** | Coming soon | Roles & permissions, view analytics, priority support, custom branding |
| **Enterprise** | Coming soon | SSO & audit logs, PII detection & retention, dedicated support |

**Promises:** No surprise bills; founding-user discounted annual rate when paid plans launch; founding-user badge.

Do **not** invent live paid prices or claim Team/Enterprise features are fully GA unless this doc is updated.

---

## 11. Extension role

- Chrome MV3 extension (Edge packaging documented); recording happens **only** in the extension
- The web app never starts recording — it receives handoff payloads and owns edit, library, share, tours, PDF
- Standalone screenshot modes live in the extension popup
- Install friction matters: primary CTA path often goes through `/install-extension`

---

## 12. Canonical URLs & CTAs

**Origin:** `https://peacockstudio.app`

| Path | Use |
| ---- | --- |
| `/` | Landing |
| `/products`, `/products/flow-documents`, `/products/product-tours`, `/products/capture-screenshot-editor` | Product pages |
| `/solutions`, `/solutions/{role}` | Role solutions |
| `/pricing` | Beta / plans |
| `/install-extension` | Extension install gate |
| `/dashboard`, `/flow-docs`, `/product-tours` | Library |
| `/editor`, `/docs/:id`, `/compare` | Authoring / compare |
| `/tours/new`, `/tours/:id` (+ `?presenter=1`) | Tours |
| `/s/:token`, `/s/:token/embed` | Public shares |
| `/privacy`, `/terms` | Legal |

**Primary CTAs:** Capture a workflow → editor (via extension gate); Build a product tour → `/tours/new`; Start free → `/dashboard`; Chrome Web Store install.

**UTM pattern for social:**

```text
https://peacockstudio.app/?utm_source=linkedin&utm_medium=social&utm_campaign=CAMPAIGN
https://peacockstudio.app/?utm_source=x&utm_medium=social&utm_campaign=CAMPAIGN
```

Optional: `utm_content` for FN vs AN or theme slug.

---

## 13. Brand voice

| Do | Don’t |
| -- | ----- |
| Confident, operational (“system of record…”) | Fake metrics, invented customer logos, fake review counts |
| Contrast, concrete (“not screen recording”) | Purple-glow generic AI stock aesthetics in image briefs |
| Problem → cost → concrete before/after | Claim AI writes guides today |
| Honest about beta and roadmap limits | Claim wiki replacement or semantic/visual compare |
| Inclusive of GTM **and** QA/support/SOP | Overpromise Team/Enterprise as live paid features |

CTA energy example: “Your next great demo starts with one recording.”

---

## 14. Hard constraints for generators

External AIs **must**:

1. Treat this file as the only product ground truth for claims.
2. Never invent features, prices, integrations, or metrics.
3. Never claim AI writes step copy; never claim semantic/visual compare (compare is index-based).
4. Never say Peacock replaces Confluence/Notion/SharePoint.
5. Be honest: free during public beta; Team/Enterprise coming soon.
6. Prefer peacockstudio.app links with UTMs above.
7. Produce posts suitable for **LinkedIn Company Page** and **X** (manual publish by a human).
8. Image: product/UI atmosphere or clear conceptual workflow — avoid generic purple gradients, terracotta-cream “AI brochure” looks, and emoji clutter.

---

## Appendix A — Theme rotation (FN / AN)

Use **one theme per slot**. Same calendar day: FN and AN must be **different** themes. Prefer skipping a theme used in the previous day’s AN when picking today’s FN.

Cycle order (repeat after #14):

| # | Theme slug | Angle |
| - | ---------- | ----- |
| 1 | `flow-documents` | Execution guides from real usage |
| 2 | `product-tours` | Persona-led multi-demo journeys |
| 3 | `extension-capture` | Chrome extension records structured steps |
| 4 | `privacy-trust` | Password exclusion, redaction, sensitive URL pause |
| 5 | `compare-docs` | Side-by-side release / before-after review |
| 6 | `pdf-export` | Offline leave-behinds and audit-friendly PDFs |
| 7 | `share-embed` | Tokenized links + iframe embed player |
| 8 | `capture-editor` | Crop, blur, redact, on-brand screenshot polish |
| 9 | `branching` | Decision paths without duplicate recordings |
| 10 | `doc-vs-player` | One asset: read mode + guided playback |
| 11 | `pmm-sales` | PMM / sales engineering use case |
| 12 | `cs-support` | CS / support / onboarding use case |
| 13 | `guest-cloud` | Guest-local start + sign-in cloud sync |
| 14 | `beta-invite` | Public beta free; founding-user promise |

**Slot mapping hint:** Day N FN → theme `((2N-2) mod 14)+1`; Day N AN → theme `((2N-1) mod 14)+1`. Cursor may adjust to avoid awkward pairs but must keep FN ≠ AN.

---

## Appendix B — Paste-ready prompt skeleton (for Cursor to fill)

When generating an FN/AN prompt, Cursor fills the bracketed fields and returns only the block below (plus any one-line theme note for the human).

```text
You are generating social content for Peacock Studio’s LinkedIn Company Page and X.

GROUND TRUTH: Use only the attached peacockstudio.md. Do not invent features, metrics, prices, or integrations.

SLOT: [FN|AN] — Theme: [slug] — [one-line angle]
CHANNELS: LinkedIn Company Page + X (human will post manually)

OUTPUT (exactly these sections):

1) HOOK — one scroll-stopping first line (no clickbait lies).
2) LINKEDIN CAPTION — 120–220 words; short paragraphs; end with a clear CTA.
3) X / TWITTER — ≤260 characters including CTA URL if possible; punchy variant of the same idea.
4) HASHTAGS — 3–5 relevant tags (product/docs/enablement — not spam).
5) CTA URLs — LinkedIn and X variants with UTMs (campaign = [campaign_slug]).
6) IMAGE — either generate an image OR provide a detailed image brief a designer/AI image model can execute:
   - Aspect: LinkedIn-friendly landscape (~1200×627) plus note for square crop on X
   - Subject: real product-workflow atmosphere or clear UI metaphor tied to [theme]
   - On-image text: max 6 words if any; must be legible
   - Avoid: purple glow, generic AI stock, terracotta-cream brochure look, emoji stickers
7) ALT TEXT — accessible description of the image.

Tone: confident, operational, concrete. Structured workflow capture — not screen recording.
```

---

## Appendix C — Quick glossary

| Term | Definition |
| ---- | ---------- |
| Flow Document | Saved recording with steps, sections, optional branches |
| Product Tour | Persona-led multi-demo narrative |
| Player | Guided step-through playback |
| Branch | Decision point linking to other docs |
| Capture Editor | Standalone screenshot polish tool |
| Compare Docs | Side-by-side docs aligned by step index |
