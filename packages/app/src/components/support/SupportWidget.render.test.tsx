import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/analytics/config', () => ({
  getFreshchatConfig: () => null,
}));

vi.mock('@/utils/isMobileClient', () => ({
  isMobileClient: () => false,
}));

import { SupportWidget } from './SupportWidget';

describe('SupportWidget render', () => {
  it('renders null when Freshchat is not configured', () => {
    const { container } = renderWithProviders(<SupportWidget />, {
      routerEntries: ['/'],
    });
    expect(container).toBeEmptyDOMElement();
  });
});
