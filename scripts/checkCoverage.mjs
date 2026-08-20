#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const summaryPath = join(process.cwd(), 'coverage', 'coverage-summary.json');
const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
const metrics = ['lines', 'statements', 'functions', 'branches'];

/** Per-package minimums — phased toward 100% monorepo (app UI is the main remaining gap). */
const packageFloors = {
  shared: { lines: 99, statements: 99, functions: 100, branches: 90 },
  app: { lines: 77, statements: 77, functions: 75, branches: 74 },
  extension: { lines: 97, statements: 97, functions: 100, branches: 84 },
};

const failures = [];

for (const [pkg, floors] of Object.entries(packageFloors)) {
  const pkgSummary = summary.packages?.[pkg];
  if (!pkgSummary || pkgSummary.error) {
    failures.push(`${pkg}: missing coverage summary`);
    continue;
  }
  for (const metric of metrics) {
    const pct = pkgSummary[metric]?.pct ?? 0;
    const floor = floors[metric] ?? 0;
    if (pct < floor) failures.push(`${pkg} ${metric}: ${pct}% (min ${floor}%)`);
  }
}

if (failures.length) {
  console.error('Coverage below package minimums:\n' + failures.join('\n'));
  process.exit(1);
}

console.log('Coverage gate passed for all package minimums.');
console.log(JSON.stringify(summary.total, null, 2));
