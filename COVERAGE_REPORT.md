# Coverage Report — Step Resources, Tags & Viewer

Generated after implementing the step resources / descriptions / tags plan. Run `pnpm test:coverage` to refresh; merged summary is written to `coverage/coverage-summary.json` and HTML to `coverage/index.html` (after merge) plus per-package `packages/*/coverage/index.html`.

## Monorepo summary (weighted by lines)

| Metric     | Covered | Total  | %     |
|------------|---------|--------|-------|
| Lines      | 39,403  | 49,853 | 79.04 |
| Statements | 39,403  | 49,853 | 79.04 |
| Functions  | 1,762   | 2,218  | 79.44 |
| Branches   | 6,653   | 8,555  | 77.77 |

## Per package

| Package     | Lines | Statements | Functions | Branches |
|-------------|-------|------------|-----------|----------|
| `@peacock/shared`    | 99.75 | 99.75      | 100.00    | 92.69    |
| `@peacock/app`       | 77.44 | 77.44      | 76.39     | 75.05    |
| `@peacock/extension` | 99.26 | 99.26      | 100.00    | 90.55    |

## Feature modules (this PR)

New/changed modules targeted at 100% as added:

| Module | Package | Notes |
|--------|---------|-------|
| `stepResource.ts` utils | shared | URL validation, label formatting, screenshot prune |
| `stepResourceDb.ts` | app | IndexedDB CRUD + cascade |
| `stepResourceRepository.ts` | app | Cloud sync |
| `flowStore` resource/tag/description actions | app | Covered in `flowStore.test.ts` |
| `flowDocumentSnapshot.ts`, `richText.ts`, `flowTags.ts` | app | Unit tests |
| `TagInput`, `StepResourceEditor`, `StepResourceList` | app | RTL smoke tests |
| `FlowDocResourcesOverview`, `PlayerStepExtras` | app | Viewer tests |
| `pdfStepLayout.ts`, `buildPdfExportPages.ts` | app | PDF layout tests |

## Test infrastructure

- Root: `pnpm test`, `pnpm test:coverage`, `pnpm test:coverage:check`
- Per-package Vitest + `@vitest/coverage-v8`, `happy-dom`, RTL setup in `packages/app/src/test/setupTests.ts`
- Extension Chrome mock: `packages/extension/src/test/chromeMock.ts`
- Merged summary: `scripts/mergeCoverage.mjs` (line-weighted totals)
- Gate: `scripts/checkCoverage.mjs` — enforces per-package minimums (see script); full 100% monorepo remains the long-term target for app UI surfaces

## Test counts

| Package | Test files | Tests (approx.) |
|---------|------------|-----------------|
| shared  | 39+        | 218+            |
| app     | 361+       | 1,219+          |
| extension | 26       | 112             |

## Remaining gap to 100%

1. **shared** (~0.7% lines, ~10% branches) — defensive branches in image/canvas utilities
2. **extension** (~2% lines, ~15% branches) — entrypoint orchestrators excluded by config; remaining branch paths in content capture
3. **app** (~23% lines) — large React pages/components (`pages/`, `editor/`, `player/`) with visual/interaction paths; continue RTL smoke + extracted pure-logic tests

## Commands

```bash
pnpm test                 # all packages
pnpm test:coverage        # coverage + merged summary
pnpm test:coverage:check  # CI gate (per-package floors)
pnpm -r typecheck         # TypeScript gate
```
