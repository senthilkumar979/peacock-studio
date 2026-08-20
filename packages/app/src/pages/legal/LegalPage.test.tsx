import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

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

import { LegalPage } from './LegalPage';

describe('LegalPage', () => {
  it('renders title and section cards', () => {
    render(
      <MemoryRouter>
        <LegalPage
          variant="privacy"
          eyebrow="Legal"
          title="Privacy Policy"
          intro="Intro copy"
          sections={[
            { heading: 'Section One', paragraphs: ['Body paragraph.'] },
            { heading: 'Section Two', bullets: ['Bullet A'] },
          ]}
          relatedPage={{
            label: 'Terms',
            href: '/terms',
            description: 'Related',
          }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /section one/i })).toBeInTheDocument();
    expect(screen.getByText(/body paragraph/i)).toBeInTheDocument();
  });
});
