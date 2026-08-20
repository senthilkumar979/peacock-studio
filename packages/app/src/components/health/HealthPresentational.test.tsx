import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HealthStatusBadge } from './HealthStatusBadge';
import { HealthCheckRow } from './HealthCheckRow';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { HealthCheckResult } from '@/types/health';

describe('HealthStatusBadge', () => {
  it.each([
    ['pass', 'Pass'],
    ['warn', 'Warn'],
    ['fail', 'Fail'],
    ['skip', 'Skip'],
    ['checking', 'Checking'],
  ] as const)('renders %s as %s', (status, label) => {
    render(<HealthStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe('HealthCheckRow', () => {
  const baseCheck: HealthCheckResult = {
    id: 'unknown-check',
    category: 'pages',
    label: 'Landing page',
    status: 'pass',
    detail: 'OK',
    checkedAt: Date.now(),
  };

  it('renders label, detail, and optional href', () => {
    renderWithProviders(<HealthCheckRow check={baseCheck} href="/health" />);
    expect(screen.getByText('Landing page')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open page/i })).toHaveAttribute('href', '/health');
  });

  it('expands method details for known check ids', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ul>
        <HealthCheckRow check={{ ...baseCheck, id: 'indexeddb', label: 'IndexedDB' }} />
      </ul>,
    );

    await user.click(screen.getByRole('button', { name: /Show method for IndexedDB/i }));
    expect(screen.getByRole('button', { name: /Hide method for IndexedDB/i })).toBeInTheDocument();
  });
});
