import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial entries for MemoryRouter (default: ['/']). */
  routerEntries?: MemoryRouterProps['initialEntries'];
  /** Extra wrapper around the tree (inside the router). */
  wrapper?: (props: { children: ReactNode }) => ReactElement | null;
}

/**
 * Render with MemoryRouter.
 *
 * Common mocks (apply in the test file before imports that use them):
 * - `@clerk/react` — useAuth / useUser / SignedIn / SignedOut / SignInButton / UserButton
 * - `@/store/flowStore` — zustand selectors used by editor/library chrome
 * - `@/analytics/analyticsClient` — trackEvent for HardErrorPage / CaptureDesktopRequired
 * - `@/cloud/config` — isCloudSyncEnabled
 * - `@/cloud/planLimits` — shouldShowEmbedWatermark
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    routerEntries = ['/'],
    wrapper: ExtraWrapper,
    ...options
  }: RenderWithProvidersOptions = {},
): RenderResult {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    const tree = ExtraWrapper ? <ExtraWrapper>{children}</ExtraWrapper> : children;
    return <MemoryRouter initialEntries={routerEntries}>{tree}</MemoryRouter>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
}
