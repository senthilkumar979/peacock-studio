import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';

vi.mock('@/components/auth/RequirePlatformSuperAdmin', () => ({
  RequirePlatformSuperAdmin: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/super-admin/SuperAdminPlatformTab', () => ({
  SuperAdminPlatformTab: () => <div>Platform tab</div>,
}));
vi.mock('@/components/super-admin/SuperAdminAcquisitionTab', () => ({
  SuperAdminAcquisitionTab: () => <div>Acquisition tab</div>,
}));
vi.mock('@/components/super-admin/SuperAdminHealthTab', () => ({
  SuperAdminHealthTab: () => <div>Health tab</div>,
}));
vi.mock('@/components/super-admin/SuperAdminApiTab', () => ({
  SuperAdminApiTab: () => <div>API tab</div>,
}));

import { SuperAdminPage } from './SuperAdminPage';

describe('SuperAdminPage', () => {
  it('renders super admin shell and default platform tab', () => {
    render(
      <MemoryRouter initialEntries={['/super-admin']}>
        <Routes>
          <Route path="/super-admin" element={<SuperAdminPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /peacock studio/i })).toBeInTheDocument();
    expect(screen.getByText('Platform tab')).toBeInTheDocument();
  });

  it('renders api tab from query', () => {
    render(
      <MemoryRouter initialEntries={['/super-admin?tab=api']}>
        <Routes>
          <Route path="/super-admin" element={<SuperAdminPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('API tab')).toBeInTheDocument();
  });
});
