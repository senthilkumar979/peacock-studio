import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render } from '@testing-library/react';
import { ApiDocsPage } from './ApiDocsPage';
import { HealthCheckerPage } from './HealthCheckerPage';
import { PlatformAdminPage } from './PlatformAdminPage';

const LocationProbe = () => {
  const location = useLocation();
  return (
    <div data-testid="loc">
      {location.pathname}
      {location.search}
    </div>
  );
};

describe('legacy super-admin redirects', () => {
  it('ApiDocsPage redirects to super-admin api tab', () => {
    render(
      <MemoryRouter initialEntries={['/api-docs']}>
        <Routes>
          <Route path="/api-docs" element={<ApiDocsPage />} />
          <Route path="/super-admin" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('loc')).toHaveTextContent('/super-admin?tab=api');
  });

  it('HealthCheckerPage redirects to super-admin health tab', () => {
    render(
      <MemoryRouter initialEntries={['/health']}>
        <Routes>
          <Route path="/health" element={<HealthCheckerPage />} />
          <Route path="/super-admin" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('loc')).toHaveTextContent('/super-admin?tab=health');
  });

  it('PlatformAdminPage redirects to super-admin platform', () => {
    render(
      <MemoryRouter initialEntries={['/platform/admin']}>
        <Routes>
          <Route path="/platform/admin" element={<PlatformAdminPage />} />
          <Route path="/super-admin" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('loc')).toHaveTextContent('/super-admin');
    expect(screen.getByTestId('loc')).not.toHaveTextContent('tab=');
  });
});
