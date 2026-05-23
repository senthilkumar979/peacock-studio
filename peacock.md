# Peacock — Detailed Build Plan (Cursor)

> Browser Flow Recorder & Interactive Demo Platform  
> Stack: TypeScript · React · Vite · Tailwind · Zustand · Supabase

---

## Overview

You are building two separate codebases that work together:

1. **Browser Extension** — records user actions, captures screenshots, injects a drawer UI into websites
2. **React Web Application** — visual editor, interactive player, PDF export, and API persistence

This plan is structured in 3 phases matching the product roadmap, with granular tasks per phase.

---

## Monorepo Setup

Before writing any code, set up a monorepo so both projects share types and utilities.

### Structure

```
peacock/
├── packages/
│   ├── extension/        ← Chrome extension (Vite + React + Manifest V3)
│   ├── app/              ← React web application (Vite + React Router)
│   └── shared/           ← Shared TypeScript types, utils, constants
├── package.json          ← Root workspace (npm workspaces or pnpm)
├── tsconfig.base.json
└── .cursorrules          ← Cursor project instructions
```

### Cursor Instructions (`.cursorrules`)

Create this file at the root. It tells Cursor about your project conventions so every AI suggestion follows them:

```
- TypeScript strict mode everywhere
- Tailwind CSS for all styling, no inline styles
- Zustand for state management, no Redux
- All coordinates stored as normalized floats (0–1), never raw pixels
- Never store base64 screenshots in memory; always use IndexedDB via Dexie
- Event types are defined in packages/shared/types/events.ts
- Never log passwords, tokens, or sensitive field values
```

---

## Shared Package (`packages/shared`)

Build this first. Both the extension and the app will import from it.

### Files to create

**`types/events.ts`** — all event type definitions

```ts
export type EventType = 'click' | 'input' | 'navigation' | 'tab-switch' | 'scroll';

export interface Viewport {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
  dpr: number;
}

export interface NormalizedPosition {
  x: number;       // raw px
  y: number;
  xPercent: number; // x / viewport.width  (0–1)
  yPercent: number; // y / viewport.height (0–1)
}

export interface ElementMeta {
  tagName: string;
  text: string;
  id: string;
  classes: string[];
  selector: string;
  xpath: string;
}

export interface ClickEvent {
  id: string;
  type: 'click';
  timestamp: number;
  url: string;
  title: string;
  viewport: Viewport;
  position: NormalizedPosition;
  element: ElementMeta;
  screenshotId: string;
}

export interface InputEvent {
  id: string;
  type: 'input';
  timestamp: number;
  url: string;
  element: ElementMeta;
  valuePreview: string;  // "Joh***" — never full value
  screenshotId: string;
}

export interface NavigationEvent {
  id: string;
  type: 'navigation';
  timestamp: number;
  fromUrl: string;
  toUrl: string;
}

export type FlowEvent = ClickEvent | InputEvent | NavigationEvent;

export interface FlowStep {
  id: string;
  event: FlowEvent;
  title: string;
  notes: string;
  screenshotId: string;
}

export interface FlowPayload {
  flow: {
    title: string;
    description: string;
    category: string;
    tags: string[];
  };
  metadata: {
    createdAt: number;
    browser: string;
    platform: string;
    screen: { width: number; height: number };
  };
  steps: FlowStep[];
}
```

**`utils/coordinates.ts`** — the core coordinate normalization logic

```ts
export function normalizePosition(
  x: number,
  y: number,
  viewport: { width: number; height: number }
): { xPercent: number; yPercent: number } {
  return {
    xPercent: x / viewport.width,
    yPercent: y / viewport.height,
  };
}

export function denormalizePosition(
  xPercent: number,
  yPercent: number,
  renderedWidth: number,
  renderedHeight: number
): { left: number; top: number } {
  return {
    left: xPercent * renderedWidth,
    top: yPercent * renderedHeight,
  };
}
```

**`utils/xpath.ts`** — generate XPath for any DOM element

```ts
export function getXPath(element: Element): string {
  // Walk up the DOM tree building an XPath string
  // e.g. /html/body/div[2]/button[1]
}
```

**`utils/selector.ts`** — generate a unique CSS selector

```ts
export function getUniqueSelector(element: Element): string {
  // Try ID → data attributes → nth-child chain
}
```

**`utils/masking.ts`** — sensitive field detection

```ts
const SENSITIVE_TYPES = ['password', 'credit-card'];
const SENSITIVE_NAMES = ['ssn', 'cvv', 'pin'];

export function isSensitiveField(el: HTMLInputElement): boolean { ... }
export function maskValue(value: string): string {
  return value.slice(0, 3) + '***';
}
```

---

## Phase 1: Extension + Editor MVP

### Extension Architecture

#### Manifest V3 (`manifest.json`)

```json
{
  "manifest_version": 3,
  "name": "Peacock",
  "version": "0.1.0",
  "permissions": ["activeTab", "scripting", "storage", "tabs"],
  "host_permissions": ["<all_urls>"],
  "background": { "service_worker": "background/index.js" },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content/index.js"],
    "run_at": "document_idle"
  }],
  "action": { "default_popup": "popup/index.html" }
}
```

#### Module 1: Background Service Worker

**File:** `extension/background/index.ts`

Responsibilities:
- Manage recording lifecycle (start, stop, pause)
- Listen for messages from content script
- Coordinate `chrome.tabs.captureVisibleTab()` calls
- Open the React app and inject the JSON payload after recording stops
- Track tab events

```ts
// Key message handlers
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case 'CAPTURE_SCREENSHOT':   return handleCapture(sender.tab!.id!);
    case 'STOP_RECORDING':       return handleStop();
    case 'GET_RECORDING_STATE':  return sendResponse(state);
  }
});

// Tab tracking
chrome.tabs.onActivated.addListener(({ tabId }) => { ... });
chrome.tabs.onUpdated.addListener((tabId, info) => { ... });
```

**Critical implementation note:** `chrome.tabs.captureVisibleTab()` must be called from the background service worker, never from the content script. The content script sends a message requesting a screenshot; the background captures and stores it.

**Screenshot timing — implement exactly like this:**

```ts
async function handleCapture(tabId: number) {
  // Wait for UI to settle (dropdowns, modals)
  await sleep(150);
  const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
  const blob = dataURLToBlob(dataUrl);
  await db.screenshots.add({ id: uuid(), blob, tabId, timestamp: Date.now() });
}
```

#### Module 2: Content Script

**File:** `extension/content/index.ts`

Attach event listeners after page load. Communicate with background via `chrome.runtime.sendMessage`.

```ts
// Click tracking
document.addEventListener('click', async (e) => {
  const el = e.target as HTMLElement;
  const viewport = getViewport();
  const position = normalizePosition(e.clientX, e.clientY, viewport);
  
  // Request screenshot from background
  const screenshotId = await chrome.runtime.sendMessage({ type: 'CAPTURE_SCREENSHOT' });
  
  // Build and store event
  const event: ClickEvent = {
    id: uuid(),
    type: 'click',
    timestamp: Date.now(),
    url: location.href,
    title: document.title,
    viewport,
    position: { x: e.clientX, y: e.clientY, ...position },
    element: extractElementMeta(el),
    screenshotId,
  };
  
  await chrome.runtime.sendMessage({ type: 'STORE_EVENT', event });
}, true);
```

**SPA navigation patching — do this on page load:**

```ts
// Patch history API to catch React/Vue/Angular navigations
const originalPushState = history.pushState.bind(history);
history.pushState = (...args) => {
  originalPushState(...args);
  handleNavigation(location.href);
};

const originalReplaceState = history.replaceState.bind(history);
history.replaceState = (...args) => {
  originalReplaceState(...args);
  handleNavigation(location.href);
};

window.addEventListener('popstate', () => handleNavigation(location.href));
```

#### Module 3: Drawer Application

**File:** `extension/drawer/DrawerApp.tsx`

This is a React app injected into any website via a closed Shadow DOM. Use Vite's library mode to bundle it.

**Injection strategy:**

```ts
// In content/index.ts
function injectDrawer() {
  const host = document.createElement('div');
  host.id = 'peacock-drawer-host';
  
  const shadowRoot = host.attachShadow({ mode: 'closed' });
  
  // Inject Tailwind styles scoped to shadow DOM
  const style = document.createElement('style');
  style.textContent = TAILWIND_CSS_STRING; // bundled at build time
  
  const container = document.createElement('div');
  shadowRoot.appendChild(style);
  shadowRoot.appendChild(container);
  document.body.appendChild(host);
  
  ReactDOM.createRoot(container).render(<DrawerApp />);
}
```

**Drawer UI states:**
- Idle — shows "Start Recording" button
- Recording — shows pulsing red indicator, "Pause" and "Stop" buttons, event count
- Paused — shows "Resume" and "Stop" buttons

#### Module 4: Storage Layer (Dexie)

**File:** `extension/storage/db.ts`

```ts
import Dexie, { type Table } from 'dexie';

export interface StoredScreenshot {
  id: string;
  blob: Blob;      // Never base64 strings
  tabId: number;
  timestamp: number;
}

export interface StoredEvent {
  id: string;
  data: FlowEvent;
  timestamp: number;
}

class PeacockDB extends Dexie {
  screenshots!: Table<StoredScreenshot>;
  events!: Table<StoredEvent>;

  constructor() {
    super('PeacockDB');
    this.version(1).stores({
      screenshots: 'id, tabId, timestamp',
      events: 'id, timestamp',
    });
  }
}

export const db = new PeacockDB();
```

#### Module 5: Payload Preparation + React App Handoff

When recording stops:

```ts
async function handleStop() {
  const events = await db.events.orderBy('timestamp').toArray();
  const screenshots = await db.screenshots.toArray();
  
  // Convert blobs to object URLs for transfer
  const screenshotUrls = Object.fromEntries(
    screenshots.map(s => [s.id, URL.createObjectURL(s.blob)])
  );
  
  const payload: FlowPayload = buildPayload(events, screenshotUrls);
  
  // Open React app and inject payload
  const tab = await chrome.tabs.create({ url: APP_URL });
  
  // Wait for app to signal ready, then inject
  chrome.runtime.onMessage.addListener(function onReady(msg) {
    if (msg.type === 'APP_READY' && msg.tabId === tab.id) {
      chrome.tabs.sendMessage(tab.id!, { type: 'INJECT_PAYLOAD', payload });
      chrome.runtime.onMessage.removeListener(onReady);
    }
  });
}
```

---

### React Web Application

#### Project Setup

```
app/
├── src/
│   ├── pages/
│   │   ├── Editor.tsx        ← main editor
│   │   ├── Player.tsx        ← interactive player
│   │   └── Dashboard.tsx     ← list of saved flows
│   ├── editor/
│   │   ├── StepList.tsx      ← left sidebar, DnD
│   │   ├── Canvas.tsx        ← screenshot + click marker
│   │   ├── StepPanel.tsx     ← right sidebar
│   │   └── Toolbar.tsx
│   ├── player/
│   │   ├── PlayerView.tsx
│   │   └── MarkerOverlay.tsx
│   ├── pdf/
│   │   └── FlowDocument.tsx  ← @react-pdf/renderer layout
│   ├── store/
│   │   └── flowStore.ts      ← Zustand
│   ├── hooks/
│   │   ├── usePayload.ts     ← reads injected JSON
│   │   └── useKeyboard.ts
│   └── services/
│       └── api.ts            ← Axios + Supabase
```

#### Zustand Store

```ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface FlowStore {
  flow: FlowPayload | null;
  steps: FlowStep[];
  selectedStepId: string | null;
  
  setFlow: (flow: FlowPayload) => void;
  selectStep: (id: string) => void;
  reorderSteps: (from: number, to: number) => void;
  deleteStep: (id: string) => void;
  updateStepNotes: (id: string, notes: string) => void;
}

export const useFlowStore = create<FlowStore>()(
  immer((set) => ({
    flow: null,
    steps: [],
    selectedStepId: null,
    
    setFlow: (flow) => set({ flow, steps: flow.steps }),
    selectStep: (id) => set({ selectedStepId: id }),
    reorderSteps: (from, to) => set((state) => {
      const [step] = state.steps.splice(from, 1);
      state.steps.splice(to, 0, step);
    }),
    deleteStep: (id) => set((state) => {
      state.steps = state.steps.filter(s => s.id !== id);
    }),
    updateStepNotes: (id, notes) => set((state) => {
      const step = state.steps.find(s => s.id === id);
      if (step) step.notes = notes;
    }),
  }))
);
```

#### Click Marker Rendering — The Critical Piece

This is the most important component to get right.

```tsx
// editor/MarkerOverlay.tsx
interface Props {
  xPercent: number;  // 0–1 normalized
  yPercent: number;
  imageRef: React.RefObject<HTMLImageElement>;
}

export function ClickMarker({ xPercent, yPercent, imageRef }: Props) {
  const [pos, setPos] = useState({ left: 0, top: 0 });
  
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;
    
    const update = () => {
      setPos({
        left: xPercent * img.clientWidth,
        top: yPercent * img.clientHeight,
      });
    };
    
    update();
    
    // Recalculate on resize
    const ro = new ResizeObserver(update);
    ro.observe(img);
    return () => ro.disconnect();
  }, [xPercent, yPercent, imageRef]);
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: pos.left,
        top: pos.top,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <PulseMarker />
    </div>
  );
}
```

**PulseMarker animation with Framer Motion:**

```tsx
import { motion } from 'framer-motion';

export function PulseMarker() {
  return (
    <div className="relative w-6 h-6">
      <motion.div
        className="absolute inset-0 rounded-full bg-blue-500"
        animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-[6px] rounded-full bg-white ring-2 ring-blue-500" />
    </div>
  );
}
```

#### Drag & Drop Step Reordering with DnD Kit

```tsx
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';

function StepList() {
  const { steps, reorderSteps } = useFlowStore();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
        {steps.map(step => <SortableStep key={step.id} step={step} />)}
      </SortableContext>
    </DndContext>
  );
}
```

#### PDF Export

```tsx
import { Document, Page, Text, Image, View, StyleSheet } from '@react-pdf/renderer';

export function FlowDocument({ flow }: { flow: FlowPayload }) {
  return (
    <Document>
      <Page style={{ padding: 40 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{flow.flow.title}</Text>
        {flow.steps.map((step, i) => (
          <View key={step.id} wrap={false}>
            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Step {i + 1}: {step.title}</Text>
            <Image style={{ width: '100%' }} src={step.event.screenshotId} />
            <Text style={{ fontSize: 11 }}>{step.notes}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
```

---

## Phase 2: Player, Sharing & Auth

### Interactive Player

```tsx
function PlayerView() {
  const { steps } = useFlowStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useKeyboard({
    ArrowRight: () => setCurrentIndex(i => Math.min(i + 1, steps.length - 1)),
    ArrowLeft:  () => setCurrentIndex(i => Math.max(i - 1, 0)),
    Space:      () => setIsPlaying(p => !p),
  });
  
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      if (currentIndex < steps.length - 1) setCurrentIndex(i => i + 1);
      else setIsPlaying(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex]);
  
  // ... render step screenshot + marker overlay + controls
}
```

### Supabase Backend

#### Database Schema

```sql
create table flows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  category text,
  tags text[],
  payload jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table flows enable row level security;

create policy "Users see own flows"
  on flows for all
  using (auth.uid() = user_id);
```

#### Screenshot Storage

Store screenshots in a Supabase Storage bucket, not embedded in the payload JSON.

```ts
export async function uploadScreenshot(blob: Blob, flowId: string): Promise<string> {
  const path = `${flowId}/${uuid()}.png`;
  await supabase.storage.from('screenshots').upload(path, blob, { contentType: 'image/png' });
  const { data } = supabase.storage.from('screenshots').getPublicUrl(path);
  return data.publicUrl;
}
```

#### Auth

Use Supabase Auth with Google OAuth. No custom auth server needed for Phase 2.

---

## Phase 3: AI Features

### AI Step Title Generation

Use `claude-haiku-4-5-20251001` — fast and cheap enough to call per step after recording stops.

```ts
async function generateStepTitle(event: ClickEvent): Promise<string> {
  const prompt = `
    A user clicked: "${event.element.text}" (${event.element.tagName})
    on page: "${event.title}" at ${event.url}
    Write a 5–8 word title. Example: "Clicked the Submit Order button"
  `;
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 50,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content[0].text.trim();
}
```

### SOP Generation

Use Claude Sonnet to convert a flow into a formal Standard Operating Procedure with Purpose, Scope, Prerequisites, Procedure, and Notes sections.

---

## Key Engineering Rules (Never Break These)

| Rule | Why |
|------|-----|
| Always normalize coordinates on capture | Raw pixels break on any screen size change |
| Never store screenshots as base64 in memory | Memory exhaustion on long recordings |
| Always wait 150ms before screenshot capture | UI needs time to settle after click |
| Always use closed Shadow DOM for drawer | Prevents host site CSS conflicts |
| Patch pushState AND replaceState | SPAs use both; missing one = missing navigations |
| Never capture password field values | Privacy and legal requirement |
| Upload screenshots to Storage, not DB column | JSON payload size limits |

---

## Privacy & Security Checklist

- [ ] Automatically pause recording on `/login`, `/payment`, `/billing` URL patterns
- [ ] Never capture `input[type=password]` events
- [ ] Mask all input values: first 3 chars + `***`
- [ ] Domain exclusion list stored in `chrome.storage.sync`
- [ ] Clear all IndexedDB data after successful upload
- [ ] Supabase Row Level Security enabled on all tables
- [ ] Supabase Storage bucket is private (signed URLs)

---

## Development Order (Cursor Workflow)

### Week 1
1. Monorepo setup, `tsconfig.base.json`, shared package
2. `shared/types/events.ts` — all type definitions
3. `shared/utils/coordinates.ts`, `masking.ts`, `xpath.ts`, `selector.ts`
4. Extension Vite + Manifest V3 config

### Week 2
5. Extension: Background service worker + `captureVisibleTab`
6. Extension: Content script + click/input/navigation listeners + SPA patch
7. Extension: Dexie storage layer (`db.ts`)
8. Extension: Payload preparation function

### Week 3
9. Extension: Drawer React app + shadow DOM injection
10. Extension: Message passing (content ↔ background ↔ drawer)
11. React app: Vite project + React Router + Tailwind
12. React app: Zustand store + `usePayload` hook

### Week 4
13. React app: Editor 3-panel layout
14. React app: Canvas + `ClickMarker` + `ResizeObserver`
15. React app: DnD step reordering (DnD Kit)
16. React app: Step edit panel (React Hook Form)

### Week 5
17. React app: PDF export (`@react-pdf/renderer`)
18. React app: Player component + keyboard navigation
19. Supabase: schema + storage bucket + RLS
20. Auth + save/load API

### Week 6+
21. Public sharing (shareable player URLs)
22. AI step titles + flow description (Haiku)
23. SOP document generation (Sonnet)
24. Dashboard: search, filter, tag management

---

## Cursor Tips for This Project

- Create `.cursorrules` at the root before anything else. Every suggestion Cursor makes will follow your coordinate and storage conventions.
- Ask Cursor to implement one module at a time. "Implement the click event listener in the content script that normalizes coordinates and messages the background" is a good prompt. "Build the content script" is not.
- Write `utils/coordinates.ts` yourself with a small test — this is the most critical logic in the entire project and should not be left to AI generation.
- When generating the editor, give Cursor the `FlowStep` and `FlowPayload` types from `shared` so it does not invent its own structures.
- Use `@` path aliases in `tsconfig.json` mapped to `packages/shared/src` so Cursor can resolve cross-package imports correctly.