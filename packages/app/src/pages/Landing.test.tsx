import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from './test/pageTestUtils';

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ isSignedIn: false, isLoaded: true, getToken: vi.fn() }),
  useUser: () => ({ isLoaded: true, user: null }),
  useClerk: () => ({ redirectToSignIn: vi.fn(), signOut: vi.fn() }),
  SignedIn: () => null,
  SignedOut: ({ children }: { children?: React.ReactNode }) => children,
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => false,
  getClerkPublishableKey: () => '',
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useIsAuthenticatedAppUser: () => false,
  useSessionMode: () => 'guest',
}));

vi.mock('@/hooks/useLandingNavVisibility', () => ({
  useLandingNavVisibility: () => ({ showMainNav: true, showSubNav: false }),
}));

vi.mock('@/analytics/analyticsClient', () => ({
  trackEvent: vi.fn(),
  identifyUser: vi.fn(),
}));

vi.mock('./landing/ProblemSection', () => ({ ProblemSection: () => <div>Problem</div> }));
vi.mock('./landing/SolutionSection', () => ({ SolutionSection: () => <div>Solution</div> }));
vi.mock('./landing/FeaturesSection', () => ({ FeaturesSection: () => <div>Features</div> }));
vi.mock('./landing/WorkflowSection', () => ({ WorkflowSection: () => <div>Workflow</div> }));
vi.mock('./landing/AutomationSection', () => ({ AutomationSection: () => <div>Automation</div> }));
vi.mock('./landing/ComparisonSection', () => ({ ComparisonSection: () => <div>Comparison</div> }));
vi.mock('./landing/PlatformComparisonSection', () => ({
  PlatformComparisonSection: () => <div>Platform</div>,
}));
vi.mock('./landing/PreviewSection', () => ({ PreviewSection: () => <div>Preview</div> }));
vi.mock('./landing/ExampleFlowDocSection', () => ({
  ExampleFlowDocSection: () => <div>Example</div>,
}));
vi.mock('./landing/FAQSection', () => ({ FAQSection: () => <div>FAQ</div> }));
vi.mock('./landing/CTASection', () => ({ CTASection: () => <div>CTA</div> }));

import { Landing } from './Landing';

describe('Landing', () => {
  it('renders hero headline', async () => {
    renderWithRouter(<Landing />);
    expect(
      await screen.findByRole('heading', {
        name: /system of record for how work actually happens/i,
      }),
    ).toBeInTheDocument();
  });
});
