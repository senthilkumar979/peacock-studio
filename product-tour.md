# Peacock Product Tour — Solutions & Pitch Reference

> **Purpose:** Canonical reference for Product Tour positioning — solutions pages, landing pages, pitch decks, sales enablement, and AI-assisted copy. Describes what Product Tours are, how they work in Peacock Studio, who they serve, and why they matter.

---

## Table of contents

1. [What is a Product Tour?](#what-is-a-product-tour)
2. [How Product Tours work](#how-product-tours-work)
3. [Core concepts & building blocks](#core-concepts--building-blocks)
4. [Benefits of Product Tours](#benefits-of-product-tours)
5. [Who uses Product Tours in an IT organization](#who-uses-product-tours-in-an-it-organization)
6. [Time & effort Product Tours reduce](#time--effort-product-tours-reduce)
7. [Product Tour vs single documentation](#product-tour-vs-single-documentation)
8. [Capabilities deep dive](#capabilities-deep-dive)
9. [Typical workflows by scenario](#typical-workflows-by-scenario)
10. [Messaging toolkit (landing & pitch)](#messaging-toolkit-landing--pitch)
11. [Honest boundaries & prerequisites](#honest-boundaries--prerequisites)
12. [Getting started](#getting-started)
13. [Glossary](#glossary)

---

## What is a Product Tour?

A **Product Tour** in Peacock Studio is a **persona-led, multi-chapter guided experience** that chains together multiple saved Peacock documents (demos) into one coherent product story.

Where a single Peacock document captures **one workflow** — for example, “Create an invoice” or “Approve a purchase order” — a Product Tour captures **why someone cares** and **how multiple capabilities fit together** for a specific audience.

### One-line definition

**Product Tour = Persona + Features + Linked demos + Guided playback.**

### Elevator pitch (30 seconds)

Product Tours turn scattered product demos into a structured narrative. Pick a buyer or user persona — VP Engineering, new hire, support agent — group your best recorded workflows into feature chapters, and deliver a guided walkthrough with screenshots, branching paths, presenter mode, and shareable links. Record once, tell the story many times, the same way every time.

### What it is

- A **container** for multiple saved Peacock docs, organized by **feature chapters**
- Anchored to a **persona** (buyer/user role with name, occupation, goals, bio)
- Delivered through **guided learner playback** with intro slides, step-by-step demos, and a completion screen
- **Reusable** across preview, live presentation, link sharing, and PDF export
- Stored **locally** in the browser alongside your documentation library

### What it is not

- Not a screen-recording video platform
- Not a slide deck or PowerPoint replacement (though it can support live storytelling like one)
- Not a cloud-hosted LMS or learning management system
- Not a replacement for deep technical API documentation
- Not automatically generated — tours are **curated** from recordings you already captured

### Relationship to Peacock Studio

Product Tours sit on top of Peacock’s core capability: **browser recording → editable step-by-step documentation**. You first record individual workflows as Peacock documents, then **assemble** those documents into tours. This separation is intentional: demos stay maintainable as standalone assets while tours provide the narrative layer.

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCT TOUR (narrative layer)               │
│  Persona · Tour title/description · Features · Completion CTA   │
└────────────────────────────┬────────────────────────────────────┘
                             │ links to
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   ┌───────────┐       ┌───────────┐       ┌───────────┐
   │  Demo 1   │       │  Demo 2   │       │  Demo 3   │
   │ (Peacock  │       │ (Peacock  │       │ (Peacock  │
   │  document)│       │  document)│       │  document)│
   └───────────┘       └───────────┘       └───────────┘
         │                   │                   │
         └───────────────────┴───────────────────┘
                             │
                    recorded via extension
                             │
                    real product in browser
```

---

## How Product Tours work

### End-to-end flow

| Phase | Who | What happens |
|-------|-----|--------------|
| **1. Capture** | Anyone with the extension | Record real workflows on the live product → each becomes a saved Peacock document with steps and screenshots |
| **2. Curate** | Tour author (PM, enablement, etc.) | Create a tour, assign a persona, add feature chapters, link demos from the library, set draft/live status |
| **3. Preview** | Author or reviewer | Walk through the tour in learner mode; click features/demos in the sidebar to jump to any section |
| **4. Deliver** | Sales, support, trainers, new hires | Share a link, present in presenter mode, export PDF, or replay self-paced |

### Tour builder (`/tours/:tourId/edit`)

1. **Create tour** — Dashboard → New product tour → auto-creates draft with one default feature
2. **Set persona** — Choose from saved personas or create one (name, occupation, age, short bio, goal, gender, company)
3. **Define tour details** — Title and description (shown in preview cards and tour intro)
4. **Build features** — Add feature chapters; each feature has a title and description
5. **Link demos** — Per feature, attach saved Peacock documents in playback order; reorder via drag-and-drop
6. **Set completion CTA** — Optional button (label + URL) on the final slide — e.g. “Book a demo”, “Start trial”
7. **Set status** — Draft or Live
8. **Preview** — Open learner playback without leaving the builder context

Auto-save persists the tour locally as you edit.

### Tour learner / playback (`/tours/:tourId`)

Playback follows a fixed **segment sequence**:

```
Persona intro
    ↓
Tour details (title, description, estimated duration)
    ↓
For each Feature:
    Feature intro
        ↓
    For each Demo (linked document):
        Demo intro (doc title, step count, branch count)
            ↓
        Demo steps (screenshots, click markers, instructions)
            ↓
        Branch points (if linked doc has branches — user picks a path)
            ↓
Tour complete (stats + optional CTA + replay)
```

**Navigation:**

- Previous / Next buttons and keyboard arrow keys
- **Sidebar overview** — click any feature or demo to jump directly to that section
- **Branch inheritance** — if a linked demo document contains branch paths, the tour pauses at branch decision points and plays the selected path inline

### Presenter mode (`/tours/:tourId?presenter=1`)

- Hides app header, sidebar overview, and footer controls
- Full-screen stage for live calls, workshops, and conference demos
- Generated from the share modal as a readonly presenter link

### Sharing & export

| Method | Use case |
|--------|----------|
| **Readonly link** | Self-paced tour for prospects, customers, or internal learners |
| **Presenter link** | Live storytelling on sales or training calls |
| **PDF export** | Offline handout, compliance archive, or email attachment |
| **Embed** | Placeholder — coming soon |

---

## Core concepts & building blocks

| Entity | Definition | Example |
|--------|------------|---------|
| **Tour** | Top-level container with title, description, status (draft/live), persona, features, optional completion CTA | “Acme Platform — Enterprise Admin Tour” |
| **Persona** | The buyer or user role the story speaks to | “Jordan Chen, IT Operations Manager, goal: reduce manual provisioning time” |
| **Feature** | A chapter grouping related demos under a product capability theme | “User & access management”, “Reporting & analytics” |
| **Demo** | A reference to a saved Peacock document, ordered within a feature | “Invite a team member” doc, “Export audit log” doc |
| **Completion CTA** | Optional call-to-action on the final slide | “Request enterprise pricing → https://…” |
| **Segment** | One screen in learner playback (persona intro, demo step, branch point, etc.) | Demo intro for “Configure SSO” |

### Persona fields (today)

| Field | Required | Purpose |
|-------|----------|---------|
| Name | Yes | Who the story is about |
| Occupation | Yes | Role context for the audience |
| Age | No | Optional human detail |
| Short bio | Yes | Quick background shown at persona intro |
| Goal | Yes | What this persona wants to achieve — frames the tour narrative |
| Gender | Yes | Used for avatar assignment |
| Company | No | Organization context |

Personas are stored in a **local library** and reusable across multiple tours.

### Draft vs Live

| Status | Meaning |
|--------|---------|
| **Draft** | Work in progress; visible on dashboard, safe to iterate |
| **Live** | Author marks tour ready for sharing and presentation |

---

## Benefits of Product Tours

### 1. Narrative coherence across many workflows

Individual docs answer “how do I do X?” Tours answer **“why should I care, and how do these pieces fit together for someone like me?”** Features provide chapter structure; persona provides emotional and role context.

### 2. Audience-specific storytelling without re-recording

The same underlying demos can appear in different tours with different personas and feature groupings. Record the product once; **recompose the story** for enterprise vs SMB, admin vs end user, sales vs support.

### 3. Consistent delivery every time

Manual live demos vary by presenter mood, memory, and depth. Product Tours deliver the **same sequence, screenshots, and talking points** whether it’s a senior AE, a new SDR, or a self-serve prospect clicking a link at midnight.

### 4. Faster enablement and onboarding

New sales reps, support agents, and hires don’t need to shadow ten calls before they can demo. They walk a tour, replay it, and learn the product story in order.

### 5. Branching without tour duplication

Linked demos inherit **branch paths** from their source documents. One tour can cover “admin path vs member path” without maintaining separate tour copies for every decision point.

### 6. Low production overhead

No video editing timeline. No screenshot paste-up in Word. Demos are **live recordings** refined in Peacock’s editor, then linked — not rebuilt from scratch for each tour.

### 7. Presenter-ready and self-serve-ready

One tour asset supports:

- Live presentation (presenter mode)
- Async evaluation (shared link)
- Printable leave-behind (PDF)
- Internal training replay

### 8. Local-first privacy

Tours, personas, and linked docs stay in the browser’s local storage. Suitable for pre-release products, internal tools, and environments where cloud upload is restricted.

### 9. Maintainability through composition

When a workflow changes, **update the underlying document** — every tour linking that demo benefits on next playback. No need to re-export a 40-slide deck or re-cut a video.

### 10. Measurable structure

Tour complete screen summarizes features, demos, and total steps — useful for scoping enablement sessions (“this tour is 6 demos, 84 steps, ~45 minutes”).

---

## Who uses Product Tours in an IT organization

### Product Owner / Product Manager

**Primary need:** Communicate roadmap value, train stakeholders, and align cross-functional teams on what shipped.

**How Product Tours help:**

- Bundle release highlights into a **feature-chapter tour** after each sprint or quarter
- Anchor the story to a persona that matches the target customer segment (e.g. “Platform Engineer at a mid-market SaaS company”)
- Share a readonly link with leadership, CS, and sales instead of scheduling repeated walkthrough meetings
- Use **draft/live** status to iterate before external sharing

**Example tour:** “Q2 Release — Admin Experience” with features for SSO, audit logs, and bulk user import.

**Time saved:** Hours per release spent rebuilding slide decks and scheduling repeat demos → one curated tour link.

---

### Business Analyst / Business stakeholder

**Primary need:** Validate that built software matches business requirements; communicate processes to non-technical stakeholders.

**How Product Tours help:**

- Record **as-is and to-be workflows** as separate demos, linked under feature chapters
- Persona reflects the business role (e.g. “Finance Approver”, “HR Business Partner”)
- Walk business sponsors through the tour in preview mode for sign-off
- PDF export provides audit-friendly documentation of expected system behavior

**Example tour:** “Procurement approval flow — Business reviewer perspective.”

**Time saved:** Fewer live replay sessions with stakeholders; async review via shared link.

---

### Development / Engineering

**Primary need:** Hand off working software, document internal tools, and reduce “how does this work?” interruptions.

**How Product Tours help:**

- Developers record flows **while building** — minimal extra effort
- Link related micro-flows under features (setup, configuration, troubleshooting)
- Internal-only tours for admin consoles, deployment tools, or developer portals
- When UI changes, re-record affected doc only — tour composition stays stable

**Example tour:** “Internal DevOps Console — On-call engineer tour.”

**Time saved:** Reduces repeated Slack explanations and ad-hoc screen shares to QA and support.

---

### QA / Test engineers

**Primary need:** Regression validation communication, test scenario documentation, and UAT coordination.

**How Product Tours help:**

- Each linked demo can represent a **test scenario** or user journey with step-level screenshots
- Branch paths in linked docs map to **decision-based test cases**
- Tour serves as a **golden path reference** — “this is the expected happy path across features”
- Compare updated docs (Peacock Compare Docs) when validating UI changes, then refresh tour links

**Example tour:** “Regression smoke — Core user journeys” with features for auth, CRUD, and reporting.

**Time saved:** Less time writing duplicate test walkthrough documents; testers and devs share one visual reference.

---

### Helpdesk / IT support / Service desk

**Primary need:** Resolve tickets faster, onboard tier-1 agents, and document standard fixes.

**How Product Tours help:**

- Persona = **end user** or **support agent** depending on audience
- Feature chapters map to common ticket categories (password reset, access request, VPN setup)
- New agents replay tours during training before taking live tickets
- Presenter mode for team standup “tool tip of the week”

**Example tour:** “Tier-1 onboarding — Top 10 resolution paths.”

**Time saved:** Weeks of shadowing compressed into self-paced replay; fewer escalations from inconsistent guidance.

---

### New hires / Onboarding (any role)

**Primary need:** Ramp up on internal tools and product surface area quickly.

**How Product Tours help:**

- Day-one persona intro sets **context** (“You are a new CS rep; your goal is to resolve billing issues in under 5 minutes”)
- Sequential features mirror **onboarding curriculum** week by week
- Self-paced navigation with sidebar jump — revisit specific demos without rewatching everything
- Completion CTA links to next step ( handbook, quiz, manager check-in)

**Example tour:** “Week 1 — Customer Support platform essentials.”

**Time saved:** Reduces live training sessions; managers spend less time repeating the same orientation demo.

---

### Sales / Pre-sales / Solution consultants

**Primary need:** Repeatable discovery demos, persona-matched pitches, and leave-behinds after calls.

**How Product Tours help:**

- **Persona-led open** — prospect sees themselves in the story before feature depth
- Multiple tours for different ICPs without re-recording (swap persona + feature emphasis)
- **Presenter mode** for clean live delivery on Zoom/Teams
- Readonly link as **post-call follow-up** — prospect revisits at their pace
- PDF export for RFP attachments or procurement packages

**Example tours:**

- “Enterprise IT — Security & compliance story”
- “SMB — Quick time-to-value story”

**Time saved:** Eliminates custom demo prep per meeting; new reps productive in days not months.

---

### Customer Success / Account management

**Primary need:** Adoption, expansion, and reduced time-to-first-value for customers.

**How Product Tours help:**

- Post-sale onboarding tours tied to **customer persona and purchased modules**
- Feature chapters align with **success milestones** (setup complete → first report → integration live)
- Share links in onboarding emails; track engagement informally via customer feedback
- Update demos when product changes — CS doesn’t rebuild training decks

**Example tour:** “Acme Analytics — Getting to first dashboard in 30 minutes.”

**Time saved:** Less 1:1 screen-share onboarding; scalable async adoption.

---

### Training & Learning & Development (L&D)

**Primary need:** Standardized training materials that stay current.

**How Product Tours help:**

- Tours as **modules** in a larger curriculum
- Replay + PDF for classroom and remote sessions
- Persona framing helps learners ** empathize with the user** they’re supporting
- Draft tours for content review before publishing as Live

**Time saved:** Content updates require re-recording changed flows, not rebuilding entire courses.

---

### Executive / Leadership

**Primary need:** Quick, credible understanding of product capabilities without deep dives.

**How Product Tours help:**

- Short tours with **3–4 features max** for board updates or all-hands
- Persona intro sets business context in 30 seconds
- Presenter mode for **all-hands demos** without editor chrome distraction
- Estimated duration helps schedule (“this tour is ~15 minutes”)

**Time saved:** Replaces custom executive briefing decks for routine product updates.

---

### Security / Compliance / Audit

**Primary need:** Evidence of controlled processes and approved user workflows.

**How Product Tours help:**

- Document **approved workflows** with timestamped capture environment metadata (browser, OS, session) inherited from linked docs
- PDF export for control evidence packages
- Readonly links for auditor review without edit access

**Example tour:** “SOC 2 — Approved admin access provisioning flow.”

**Time saved:** Less manual screenshot collection for audit cycles.

---

## Time & effort Product Tours reduce

### Compared to manual documentation

| Activity | Manual approach | With Product Tours | Typical reduction |
|----------|-----------------|--------------------|-------------------|
| First demo script + screenshots | 4–8 hours per major workflow | 30–60 min record + 30 min edit per doc | **70–85%** |
| Multi-feature narrative deck | 2–3 days per storyline | 2–4 hours curate + link existing demos | **75–90%** |
| Sales enablement pack | 1–2 weeks per release | Re-link + persona swap on existing demos | **60–80%** |
| New hire product orientation | 3–5 live sessions × 1 hr | Self-paced tour + 1 Q&A session | **50–70%** live time |
| Support playbook update after UI change | Re-screenshot entire PDF/wiki | Re-record changed doc; tour auto-reflects | **80%+** on updates |
| Post-call prospect follow-up | Custom Loom or email bullets | Share readonly tour link | **90%+** prep time |

*Ranges vary by product complexity and team maturity. Estimates assume Peacock extension is installed and authors are familiar with recording.*

### Compared to video

| Dimension | Screen recording video | Product Tour |
|-----------|------------------------|--------------|
| Update cost | Re-record and re-edit entire video | Re-record one changed document |
| Navigation | Scrub timeline | Jump to feature/demo/step |
| Branching | Separate videos per path | Inline branch points from linked docs |
| Accessibility | Often poor (no structure) | Step titles, instructions, keyboard nav |
| File size / hosting | Large files | Local-first; link-based sharing |

### Compounding value

Product Tours **compound** because demos are reusable assets:

- One “Create project” doc might appear in **sales**, **onboarding**, and **support** tours
- Persona swap reframes the same demos for a different audience in minutes
- Presenter link + readonly link + PDF come from **one curated tour**

---

## Product Tour vs single documentation

| Question | Single Peacock document | Product Tour |
|----------|-------------------------|--------------|
| Best for | One task, one workflow, one SOP | Multi-capability story for a role |
| Structure | Linear steps (+ optional branches) | Persona → features → demos → steps |
| Audience framing | Implicit | Explicit persona with goals |
| Navigation | Step list | Feature/demo overview + jump navigation |
| Live presentation | Player view | Presenter mode across multiple docs |
| Maintenance | Edit one doc | Edit underlying docs; tour composition persists |
| Duration | Usually 2–15 minutes | Often 15–60+ minutes (multi-demo) |

**Rule of thumb:** If you need more than one recorded workflow to tell the story, or you need to frame *who* the story is for, use a Product Tour.

---

## Capabilities deep dive

### Persona library

- Create, edit, and reuse personas across tours
- Slide-in drawer editor (same UX pattern as flow details)
- Avatar auto-assigned by gender
- Default persona “Product explorer” for new tours until changed

### Feature chapters

- Unlimited features per tour (practical limit: audience attention)
- Title + description shown at feature intro
- Demos ordered within each feature — order matters in playback

### Demo linking

- Pick any saved Peacock document from the library
- Demo displays **document title** in overview (not generic “Demo 1”)
- Drag-and-drop reorder within a feature
- Removing a demo unlinks it — underlying doc remains in library

### Branch inheritance

- If a linked demo contains **branch nodes**, tour playback stops at branch decision panels
- User selects a path; linked sub-flow plays inline
- No duplicate tour needed for admin vs member paths

### Overview sidebar (learner)

- Live tour map: features, demos, active location
- Click feature → jump to feature intro
- Click demo → jump to demo intro
- Scrollable full list — not clipped by playback footer

### Estimated duration

- Calculated from total playable steps across all linked demos (~30 seconds per step heuristic)
- Shown at tour details intro

### Completion experience

- Summary stats: feature count, demo count, step count
- Optional CTA button (external URL)
- Replay tour action

### PDF export

- Multi-demo narrative export when tour has exportable linked documents
- Suitable for offline sharing and compliance archives

### Auto-save & draft safety

- Tour builder auto-persists to IndexedDB
- Draft status for work-in-progress
- Single-flight tour creation prevents duplicate empty drafts

---

## Typical workflows by scenario

### Scenario A — Sales launch kit

1. PM/SE records 5–8 key workflows as Peacock docs after release
2. Enablement creates tour: persona = “VP Engineering”, features = Security, Scale, Integrations
3. Mark Live, generate presenter link for AE team
4. Post-call: send readonly link to prospect

### Scenario B — Internal tool onboarding

1. Dev records admin console flows
2. Platform team builds tour: persona = “New platform engineer”
3. HR/L&D adds tour link to onboarding checklist
4. Completion CTA → internal wiki

### Scenario C — UAT sign-off

1. BA records expected workflows on staging
2. Tour shared with business sponsors (readonly)
3. Feedback → update specific docs → tour reflects changes
4. PDF exported for sign-off archive

### Scenario D — Support tier-1 curriculum

1. Senior agent records top resolution paths
2. Features grouped by ticket category
3. New hires replay tour in first week
4. Presenter mode for weekly team refreshers

---

## Messaging toolkit (landing & pitch)

### Headlines (pick by audience)

| Audience | Headline |
|----------|----------|
| General | Turn product demos into persona-led tours |
| Sales | Same demo. Every rep. Every prospect. |
| Product | Ship features with a story, not a slide deck |
| Support | Onboard agents with guided tours, not shadowing marathons |
| Leadership | One link. Full product story. |

### Subheadlines

- Record real workflows once. Chain them into chaptered tours anchored to your buyer’s role.
- Persona intro → feature chapters → live screenshots → presenter-ready links.
- No video editing. No screenshot paste-up. Local-first and private.

### Value bullets (landing page)

- **Persona-led** — Open with who the story is for and what they want to achieve
- **Chaptered** — Group demos into features that match how buyers think
- **Composable** — Link existing recordings; update one doc, refresh every tour using it
- **Presenter mode** — Clean fullscreen delivery for live calls
- **Self-serve links** — Prospects and hires replay async
- **PDF export** — Leave-behinds and compliance packages
- **Branch-aware** — Decision paths from linked docs play inline

### Pitch deck slide outline

1. **Problem** — Demos don’t scale; every rep tells a different story; docs go stale
2. **Insight** — Separate **capture** (record once) from **narrative** (compose for audience)
3. **Product Tour** — Persona + features + linked demos + guided playback
4. **Demo** — Show builder → preview → presenter mode (30 sec each)
5. **Who it’s for** — Sales, CS, support, onboarding, QA, PM
6. **ROI** — Time table from this document
7. **Peacock platform** — Tours sit on recording + editing + branching + PDF
8. **CTA** — Install extension, record first doc, build first tour

### FAQ (solutions page)

**How is a Product Tour different from a Peacock document?**
A document is one workflow. A tour chains many documents into a persona-led story with feature chapters.

**Do I re-record for every tour?**
No. Link existing docs. Change persona and feature grouping to refocus the narrative.

**Can I use tours internally only?**
Yes. Everything is local-first in your browser — no cloud account required.

**What happens when the product UI changes?**
Re-record the affected document. Tours linking that demo show updated steps on next playback.

**Can tours handle different user paths?**
Yes. Linked documents can include branch points; tours inherit them during playback.

**Is there presenter mode?**
Yes. Append `?presenter=1` for chrome-free live presentation.

---

## Honest boundaries & prerequisites

### Prerequisites

1. **Peacock browser extension** installed (Chrome / Edge)
2. At least one **saved Peacock document** to link as a demo
3. **Modern browser** with IndexedDB support for local storage

### Current limitations

| Limitation | Detail |
|------------|--------|
| **No cloud sync** | Tours live on the device where created; sharing is via links on same origin / exported PDF |
| **No analytics** | No built-in view tracking or completion metrics |
| **No embed yet** | Embed code is placeholder |
| **Manual curation** | Tours are assembled, not AI-generated |
| **Single persona per tour** | One persona anchors each tour (use multiple tours for multiple ICPs) |
| **Link demos only** | Demos must exist as saved docs first — cannot record inline inside tour builder |

### When not to use Product Tours

- Single simple task → use one Peacock document
- Highly dynamic sandbox demos requiring live data → may need live environment alongside tour
- Animated marketing sizzle reels → video may still be better for emotional brand spots

---

## Getting started

### Minimum path (15 minutes)

1. Install Peacock extension
2. Record one workflow → stop → edit in flow editor → save
3. Dashboard → **New product tour**
4. Set persona (or keep default)
5. Link your doc under Feature 1
6. **Preview tour** → walk through playback
7. Mark **Live** → Share link

### Recommended first tour structure

| Element | Recommendation |
|---------|----------------|
| Features | 3–5 chapters |
| Demos per feature | 1–3 |
| Total steps | 40–80 for a ~20–40 min session |
| Persona | Specific role + concrete goal |
| Completion CTA | One clear next step |

---

## Glossary

| Term | Definition |
|------|------------|
| **Product Tour** | Multi-demo, persona-led guided experience |
| **Persona** | Buyer/user role profile anchoring the tour narrative |
| **Feature** | Chapter grouping demos under a product theme |
| **Demo** | Linked reference to a saved Peacock document |
| **Learner** | Playback mode at `/tours/:tourId` |
| **Presenter mode** | Chrome-free playback at `/tours/:tourId?presenter=1` |
| **Segment** | One step in the learner sequence (intro, step, branch, complete) |
| **Completion CTA** | Optional button on final slide |
| **Peacock document** | Recorded step-by-step guide with screenshots |

---

## Document metadata

| Field | Value |
|-------|-------|
| Product | Peacock Studio — Product Tour |
| Version | 1.0 |
| Last updated | June 2025 |
| Source of truth | Peacock codebase + `document.md` |
| Intended use | Solutions page, landing page, pitch deck, sales enablement |

---

*Peacock Studio — Record once. Tell the story many times.*
