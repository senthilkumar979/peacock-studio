import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/utils/notify', () => ({
  notifyError: vi.fn(),
  notifyWarning: vi.fn(),
}));

import { GlobalErrorListeners } from './GlobalErrorListeners';

describe('GlobalErrorListeners', () => {
  it('mounts without crashing', () => {
    const { container } = renderWithProviders(<GlobalErrorListeners />);
    expect(container).toBeEmptyDOMElement();
  });
});
