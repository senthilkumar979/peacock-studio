import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { GuestShareAccessNotice } from './GuestShareAccessNotice';
import { EmbedPublicAccessNote } from './EmbedPublicAccessNote';
import { ShareAuthRequiredGate } from './ShareAuthRequiredGate';
import { PdfExportBlockingOverlay } from './PdfExportBlockingOverlay';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('share presentational', () => {
  it('GuestShareAccessNotice links to sign-up and sign-in', () => {
    renderWithProviders(<GuestShareAccessNotice />, { routerEntries: ['/docs/1'] });
    expect(screen.getByRole('status')).toHaveTextContent(/Share links and embeds need an account/i);
    expect(screen.getByRole('link', { name: 'Sign up free' })).toHaveAttribute('href', '/sign-up');
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in');
  });

  it('EmbedPublicAccessNote warns that embeds are public', () => {
    renderWithProviders(<EmbedPublicAccessNote />);
    expect(screen.getByRole('note')).toHaveTextContent(/Embeds are public/i);
  });

  it('ShareAuthRequiredGate shows auth CTAs', () => {
    renderWithProviders(<ShareAuthRequiredGate returnPath="/s/token" />);
    expect(screen.getByRole('heading', { name: 'Sign in required' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in to view' })).toHaveAttribute(
      'href',
      '/sign-in',
    );
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go home' })).toBeInTheDocument();
  });

  it('PdfExportBlockingOverlay portals when active', () => {
    const { rerender } = renderWithProviders(
      <PdfExportBlockingOverlay isActive={false} />,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(<PdfExportBlockingOverlay isActive message="Building PDF…" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Building PDF…');
    expect(screen.getByRole('status', { name: 'Loading Peacock Studio' })).toBeInTheDocument();
  });
});
