#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const packages = ['shared', 'app', 'extension'];
const merged = {
  total: {
    lines: { total: 0, covered: 0, pct: 0 },
    statements: { total: 0, covered: 0, pct: 0 },
    functions: { total: 0, covered: 0, pct: 0 },
    branches: { total: 0, covered: 0, pct: 0 },
  },
  packages: {},
};

const metrics = ['lines', 'statements', 'functions', 'branches'];

for (const pkg of packages) {
  const summaryPath = join(process.cwd(), 'packages', pkg, 'coverage', 'coverage-summary.json');
  try {
    const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
    merged.packages[pkg] = summary.total;
    for (const key of metrics) {
      const metric = summary.total[key];
      merged.total[key].total += metric.total ?? 0;
      merged.total[key].covered += metric.covered ?? 0;
    }
  } catch {
    merged.packages[pkg] = { error: 'missing coverage summary' };
  }
}

for (const key of metrics) {
  const { total, covered } = merged.total[key];
  merged.total[key].pct = total > 0 ? Number(((covered / total) * 100).toFixed(2)) : 0;
}

const outDir = join(process.cwd(), 'coverage');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'coverage-summary.json'), JSON.stringify(merged, null, 2));
console.log('Merged coverage summary written to coverage/coverage-summary.json');
console.log(
  JSON.stringify(
    Object.fromEntries(metrics.map((k) => [k, { pct: merged.total[k].pct }])),
    null,
    2,
  ),
);
