# Peacock Studio design system

Living reference for the visual language and reusable UI contracts in `@peacock/app`. Documents **what ships today** — not aspirational redesign notes.

**Audience:** engineers (and agents) extending the React app.

**Not covered:** Chrome extension UI, Storybook, a separate token package, or inventing CSS variables that do not exist in the codebase.

---

## Principles

- **Tailwind for UI chrome** — style with utility classes and shared component class strings; avoid inline styles for product UI (canvas/PDF paint and measured layout are exceptions).
- **Peacock blue + slate** — primary actions use `peacock-*`; neutrals use `slate-*`; cyan/violet accents are for marketing highlights, not everyday product chrome.
- **Light product, dark marketing** — library/editor/player are light; marketing hero and dark sections are local variants, not an app-wide theme.
- **Prefer the shared kit** — use `components/ui` (`Button`, fields, footer actions) instead of one-off control styles.
- **Accessible by default** — peacock focus rings, dialog ARIA roles, skip link, and reduced-motion on shared motion wrappers.

---

## Brand identity

| Token / asset | Value / path |
|---|---|
| Product name | `Peacock Studio` (`PEACOCK_APP_NAME` in `src/constants/branding.ts`) |
| Logo | `/peacock-logo.png` (`PEACOCK_LOGO_SRC`); used in nav, headers, `PeacockStudioLoader` |
| Favicon | `public/favicon.ico` |
| Open Graph image | `public/og-social.png` |
| Theme color (meta) | `#2563EB` (`index.html` `theme-color`) |

### Org white-label

Org branding (`logoUrl`, `primaryColor`) resolves via `resolveOrgBranding` in `src/cloud/types/orgBranding.ts`. It affects **PDF/player chrome**, not the marketing site palette. Missing values fall back to Peacock defaults (`PEACOCK_LOGO_SRC`, `BRAND_COLORS.primary`).

---

## Color system

There are **no CSS custom properties** for brand colors. Tokens live in Tailwind theme extend + TypeScript constants. Keep them in sync when changing the palette.

### Tailwind — `peacock` / `brand`

Defined in `tailwind.config.js`:

| Token | Hex |
|---|---|
| `peacock-50` | `#eff6ff` |
| `peacock-100` | `#dbeafe` |
| `peacock-200` | `#bfdbfe` |
| `peacock-500` | `#3b82f6` |
| `peacock-600` | `#2563eb` |
| `peacock-700` | `#1d4ed8` |
| `peacock-800` | `#1e40af` |
| `peacock-900` | `#172554` |
| `brand-cyan` | `#06b6d4` |
| `brand-violet` | `#7c3aed` |

The scale is intentionally sparse (no `300` / `400` / `950` in theme). Some utilities (e.g. field focus `border-peacock-300`) rely on Tailwind’s default behavior for missing stops — prefer documented stops above for new work.

### TypeScript — `BRAND_COLORS`

From `src/constants/branding.ts` (aligned with Tailwind):

| Key | Hex | Typical use |
|---|---|---|
| `primary` | `#2563EB` | Theme color, org fallback (`peacock-600`) |
| `primaryHover` | `#1D4ED8` | Hover (`peacock-700`) |
| `primaryFocus` | `#3B82F6` | Focus accent (`peacock-500`) |
| `primaryMutedBg` | `#EFF6FF` | Soft surfaces (`peacock-50`) |
| `primaryMutedBorder` | `#BFDBFE` | Soft borders (`peacock-200`) |
| `primaryLabel` | `#1D4ED8` | Instruction labels |
| `primaryInstructionText` | `#1E3A5F` | Instruction body (PDF) |
| `accentCyan` | `#06B6D4` | Marketing accent |
| `accentViolet` | `#7C3AED` | Marketing accent |

PDF export reuses these via `src/pdf/pdfTheme.ts` (`PDF_COLORS`).

### Semantic usage

| Role | Classes / colors |
|---|---|
| Primary actions / focus | `peacock-500`–`700`; `.btn-peacock` |
| Text, borders, neutrals | `slate-*` |
| Danger | `red-*` (`Button` `danger` / `dangerSolid` / `ghostDanger`) |
| Accents | `brand-cyan`, `brand-violet` — gradients, orbs, dark-section eyebrows |
| Product surfaces | `white`, `slate-50` |
| Marketing dark surfaces | `slate-950`, `peacock-900` |

**Sync rule:** when adding or changing brand colors, update both `tailwind.config.js` and `BRAND_COLORS` together.

---

## Typography

| Surface | Font |
|---|---|
| **SPA UI** | Tailwind default sans (`ui-sans-serif`, `system-ui`, …). Lexend / Inter are **not** loaded for the web shell. |
| **PDF export** | Lexend 400/600/700 via `@fontsource/lexend` (`src/pdf/registerPdfFonts.ts`, `PDF_FONT_FAMILY` in `pdfTheme.ts`) |
| **Flow map canvas PNG** | `Lexend, ui-sans-serif, system-ui, sans-serif` (`exportFlowMapCanvasPng.ts`) |
| **Capture header paint** | `Inter, system-ui, sans-serif` (`capture-editor/captureHeaderTypography.ts`) |

### De facto scale

- Controls / labels: `text-xs`, `text-sm`; labels often `font-medium text-slate-700`
- Marketing section titles: `text-3xl` / `sm:text-4xl`, `font-bold`, `tracking-tight`
- Marketing eyebrows: `text-xs font-semibold uppercase tracking-[0.16em]` — `text-peacock-700` on light/muted, `text-brand-cyan` on dark (`LandingSectionShell`)

---

## Spacing, radius, elevation, focus

Not extended in Tailwind config — conventions from components:

| Concern | Convention |
|---|---|
| **Radius** | Controls: `rounded-lg` (0.5rem). Panels/modals: `rounded-xl`. Large sections: `rounded-3xl`. Badges: pill / `rounded-full` as needed. |
| **Shadows** | Chrome: `shadow-sm`. Cards/modals: `shadow-lg` / `shadow-xl`. Colored: `shadow-peacock-500/20` sparingly. |
| **Focus** | Fields/actions: `ring-2 ring-peacock-500`. Primary CTA: dual ring via `.btn-peacock:focus-visible` (white + peacock). |
| **Marketing width** | `max-w-7xl` via `.landing-section-inner` |
| **Library / app width** | Many layouts use `max-w-8xl` in classNames **without** a Tailwind theme extension — treat as a de facto library width, not a formal token until added to config. |

---

## Global CSS component classes

From `src/index.css`:

### Primary button

- `.btn-peacock` — primary CTA: peacock-500 bg, white text, hover peacock-600, dual-ring focus, disabled opacity 0.6
- `.btn-peacock--sm` — tighter horizontal padding

Prefer `<Button variant="primary" />`, which applies these classes.

### Landing sections

| Class | Role |
|---|---|
| `.landing-page` | Page shell: `min-h-screen bg-slate-50 text-slate-900 antialiased` |
| `.landing-section` | Vertical rhythm: `px-6 py-24 sm:py-28` |
| `.landing-section-light` | White section + slate border |
| `.landing-section-muted` | `slate-50` section |
| `.landing-section-dark` | `slate-950` / white text |
| `.landing-section-inner` | `mx-auto max-w-7xl` |
| `.landing-section-header` | `max-w-3xl` |
| `.landing-section-body` | `mt-12` |

### Legacy motion

`@keyframes fadeIn` (opacity + 8px translateY) exists in CSS. Prefer **Framer Motion** and `components/motion` for new work.

---

## Reusable UI kit

**Directory:** `src/components/ui/`  
**Import:** `@/components/ui` (barrel in `index.ts`)

Pattern: named exports, `forwardRef` on controls, Tailwind strings composed with `cn()`.

### `cn`

```ts
cn(...values: Array<string | false | null | undefined>): string
```

Joins truthy class fragments. No `clsx` / `tailwind-merge` — avoid conflicting utilities in the same call.

### `Button`

Shared button for product UI.

| Prop | Values | Default |
|---|---|---|
| `variant` | `primary` \| `secondary` \| `danger` \| `dangerSolid` \| `soft` \| `ghost` \| `ghostDanger` | `primary` |
| `size` | `sm` \| `md` \| `icon` | `md` |
| …rest | Native `ButtonHTMLAttributes` (`type` defaults to `button`) | |

| Variant | Look |
|---|---|
| `primary` | `.btn-peacock` (+ `--sm` when `size="sm"`) |
| `secondary` | White, slate border, slate-700 text |
| `danger` | Soft red border/bg (`red-50` / `red-700`) |
| `dangerSolid` | Solid `red-600` |
| `soft` | Compact peacock-tinted chip |
| `ghost` | Icon-friendly slate hover |
| `ghostDanger` | Icon-friendly red hover |

```tsx
import { Button } from '@/components/ui';

<Button variant="primary">Save</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="dangerSolid" onClick={onDelete}>Delete</Button>
```

### `FormField`

Accessible label / hint / error wrapper. Wires `id`, `aria-describedby`, and `aria-invalid` onto the child control via `cloneElement`.

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` | Required; `text-sm font-medium text-slate-700` |
| `hint` | `string?` | Optional helper (`text-xs text-slate-500`) |
| `error` | `string?` | Sets `aria-invalid` and shows red error text |
| `htmlFor` | `string?` | Override; otherwise `useId()` |
| `children` | `ReactNode` | Typically one field control |

```tsx
import { FormField, FieldInput } from '@/components/ui';

<FormField label="Title" hint="Shown in the library" error={errors.title}>
  <FieldInput hasError={Boolean(errors.title)} value={title} onChange={…} />
</FormField>
```

### `FieldInput` / `FieldSelect` / `FieldTextarea`

Styled native controls sharing `fieldStyles`. All support `hasError?: boolean` and `forwardRef`.

### `fieldStyles`

| Export | Role |
|---|---|
| `fieldInputClassName` | Default input/select chrome |
| `fieldTextareaClassName` | Same + `resize-none` |
| `fieldErrorClassName` | Error border/ring overrides |

**Visual contract:**

- Default: `rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm`, focus `border-peacock-300` + `ring-2 ring-peacock-500`
- Error: `border-red-600` + `focus:ring-red-500`
- Disabled: `opacity-60`

Use the class exports when composing a custom control that should match the kit.

### `ModalFooterActions`

Cancel + confirm row for modals/dialogs.

| Prop | Default | Notes |
|---|---|---|
| `onCancel` / `onConfirm` | required | |
| `cancelLabel` | `'Cancel'` | |
| `confirmLabel` | required | |
| `isConfirmLoading` | `false` | Shows `Loader2` spinner + `confirmLoadingLabel` |
| `confirmLoadingLabel` | `'Saving…'` | |
| `isDestructive` | `false` | Confirm uses `dangerSolid` vs `primary` |
| `size` | `'md'` | Passed to both buttons (`sm` \| `md`) |
| `trailing` | — | Optional node after confirm |

### `ActionTooltip`

CSS-only hover/focus tooltip for icon actions (library/chrome). Not Radix.

| Prop | Default |
|---|---|
| `label` | required |
| `side` | `'top'` (`'top'` \| `'bottom'`) |
| `wide` | `false` — wider wrapping hint for long copy |

Appearance: dark slate pill (`bg-slate-900`, `text-[11px]`), opacity on `group-hover` / `group-focus-within`.

---

## Shared patterns outside `ui/`

These are established conventions, not a second component library.

### Confirm dialog

`ConfirmDialog` (`src/components/ConfirmDialog.tsx`): centered `role="alertdialog"`, Escape to cancel (blocked while loading), scrim `bg-slate-900/50`, panel `rounded-xl bg-white p-6 shadow-xl`, footer via `ModalFooterActions`.

### Modal shell (convention)

There is **no shared `Modal` primitive**. Feature modals typically use:

- `fixed inset-0 z-50` overlay
- Scrim: `bg-slate-900/50`
- Panel: white, `rounded-xl`, `shadow-xl`, padding
- Footer: `ModalFooterActions`

### Drawers

Right-side panels (e.g. persona / flow details drawers): Framer Motion slide (`x: '100%' → 0`), shared ease `[0.22, 1, 0.36, 1]`, Escape + body scroll lock.

### App chrome

| Component | Role |
|---|---|
| `SiteNav` | Marketing — dark / peacock glass bar |
| `LandingSubNav` | Landing section jump links |
| `LibraryNav` | Authenticated library — light sticky blur, animated active underline |
| `AppHeader` | Editor/player — light sticky header + context |
| `PublicAppFooter` / `AuthenticatedAppFooter` | Marketing vs in-app footers |

### Landing sections

`LandingSectionShell` (`pages/landing/LandingSectionShell.tsx`): eyebrow + title + description + `tone` (`light` \| `muted` \| `dark`), maps to landing CSS classes, fade/slide header via Framer Motion.

### Loader

`PeacockStudioLoader` — branded pulsing logo for loading states.

### Toasts

`goey-toast` via `src/utils/notify.ts` (`notifySuccess`, `notifyError`, …). Hosted in `AppProviders` as `GooeyToaster` with `theme="light"`, `position="bottom-center"`.

### Icons

`lucide-react` named imports. Typical sizes `h-3.5 w-3.5`–`h-5 w-5`; tint with `text-peacock-600` or slate; decorative icons often `aria-hidden`.

---

## Motion

Library: `framer-motion`. Shared tokens in `src/components/motion/pageMotion.ts`:

```ts
PAGE_EASE = [0.22, 1, 0.36, 1]
pageTransitionTiming / shellFadeTiming → duration 0.28, ease PAGE_EASE
```

| Primitive | Behavior |
|---|---|
| `AppRouteTransition` | Soft route opacity fades; skips landing, library shell routes, initial paint; respects `useReducedMotion` |
| `SmoothLoadReveal` | Loading ↔ content fade; reduced-motion falls back to static swap |
| Marketing / landing | `whileInView` fade/slide (`y: 16 → 0`, `viewport: { once: true }`); landing wraps `MotionConfig reducedMotion="user"` |

**Rule:** reuse `PAGE_EASE` / motion primitives; always honor reduced motion for shared transitions.

---

## Surface map

| Surface | Chrome | Background |
|---|---|---|
| Marketing | Dark fixed `SiteNav`; landing section tones | Hero dark; alternating light / muted / dark sections |
| Library | Light sticky `LibraryNav` | `slate-50` / white, often `max-w-8xl` |
| Editor / player | Light sticky `AppHeader` | White / slate workspace |

**No app-wide dark mode** — no `darkMode` in Tailwind config, no `ThemeProvider`, toaster forced to light. Dark UI appears only as local marketing or capture variants.

---

## Do / don’t

**Do**

- Prefer `Button`, `FormField`, and field controls over ad-hoc button/input classes
- Put new shared primitives in `src/components/ui/` and export from `index.ts`
- Keep Tailwind `peacock` / `brand` and `BRAND_COLORS` aligned
- Match existing peacock blue + slate; use cyan/violet only as accents
- Use cards for interactive containers when structure needs them; keep marketing heroes uncluttered

**Don’t**

- Invent a parallel palette (generic purple-on-white kits, cream/serif systems, heavy glow stacks)
- Add CSS variables unless intentionally migrating the token system
- Skip focus rings or reduced-motion on new shared motion
- Assume Lexend is the SPA UI font — it is PDF/canvas today

---

## Known gaps

Honest limits of the current system:

- No shared `Modal` / drawer primitive — copy the fixed-overlay convention
- Incomplete `peacock` scale in Tailwind (`300`/`400` not defined)
- `max-w-8xl` used widely but not defined in `theme.extend`
- SPA UI does not load Lexend despite PDF/canvas usage
- Some headers/landing CTAs still use one-off Tailwind button classes instead of `Button`

---

## Source index

| Concern | Path |
|---|---|
| Tailwind theme | `tailwind.config.js` |
| Global / landing CSS | `src/index.css` |
| Brand constants | `src/constants/branding.ts` |
| UI kit | `src/components/ui/` |
| Motion | `src/components/motion/` |
| Confirm dialog | `src/components/ConfirmDialog.tsx` |
| Org branding | `src/cloud/types/orgBranding.ts` |
| Toasts | `src/utils/notify.ts`, `AppProviders` |
| PDF theme / fonts | `src/pdf/pdfTheme.ts`, `src/pdf/registerPdfFonts.ts` |
| Landing section shell | `src/pages/landing/LandingSectionShell.tsx` |
| Theme color meta | `index.html` |
