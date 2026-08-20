import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { HealthCheckResult } from '@/types/health';
import { HealthCheckList } from './HealthCheckList';
import { HealthCheckMethodDetails } from './HealthCheckMethodDetails';
import { HealthOverviewPanel } from './HealthOverviewPanel';

const check: HealthCheckResult = {
  id: 'indexeddb',
  category: 'connections',
  label: 'IndexedDB',
  status: 'pass',
  detail: 'OK',
  checkedAt: Date.now(),
};

describe('health remaining', () => {
  it('HealthCheckList shows title', () => {
    renderWithProviders(
      <HealthCheckList
        title="Connections"
        description="Local stores"
        category="connections"
        results={[check]}
      />,
    );
    expect(screen.getByText('Connections')).toBeInTheDocument();
  });

  it('HealthCheckMethodDetails shows sections', () => {
    renderWithProviders(
      <HealthCheckMethodDetails
        method={{
          what: 'Storage',
          how: 'Probe',
          interpret: 'Pass means writable',
        }}
      />,
    );
    expect(screen.getByText('What is checked')).toBeInTheDocument();
  });

  it('HealthOverviewPanel shows overall status', () => {
    renderWithProviders(
      <HealthOverviewPanel results={[check]} isRunning={false} ranAt={Date.now()} />,
    );
    expect(screen.getByText('Overall status')).toBeInTheDocument();
  });
});
