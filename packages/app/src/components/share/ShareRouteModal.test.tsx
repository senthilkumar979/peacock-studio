import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/storage/flowLibraryDb', () => ({
  getRoute: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/utils/notify', () => ({
  notifyPromise: vi.fn((p: Promise<unknown>) => p),
}));

vi.mock('@/pdf/exportRoutePdf', () => ({
  exportRoutePdf: vi.fn(),
  routeHasExportablePeacocks: () => true,
}));

import { ShareRouteModal } from './ShareRouteModal';

const route = {
  id: 'route-1',
  title: 'Checkout route',
  description: '',
  status: 'live',
  peacocks: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe('ShareRouteModal', () => {
  it('renders share dialog when open', async () => {
    renderWithProviders(
      <ShareRouteModal isOpen routeId="route-1" route={route as never} onClose={vi.fn()} />,
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Share route' })).toBeInTheDocument();
  });
});
