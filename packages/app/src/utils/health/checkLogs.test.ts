import { describe, expect, it } from 'vitest';
import { checkLogSources } from './checkLogs';

describe('checkLogSources', () => {
  it('always includes client diagnostics pass and cloud-init pass when no error', () => {
    const results = checkLogSources(null);
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      id: 'log-console',
      category: 'logs',
      status: 'pass',
    });
    expect(results[1]).toMatchObject({
      id: 'log-cloud-init',
      status: 'pass',
      detail: 'No cloud initialization error recorded.',
    });
  });

  it('reports cloud-init fail when error string is provided', () => {
    const results = checkLogSources('Clerk JWT rejected');
    expect(results[1]).toMatchObject({
      id: 'log-cloud-init',
      status: 'fail',
      detail: 'Clerk JWT rejected',
    });
  });
});
