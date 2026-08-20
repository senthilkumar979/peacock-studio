import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserMockup } from './BrowserMockup';

vi.mock('framer-motion', () => ({
  motion: { div: 'div', button: 'button', span: 'span' },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe('BrowserMockup', () => {
  it('renders a normalized URL and children', () => {
    render(
      <BrowserMockup url="https://example.com/path">
        <div>Stage content</div>
      </BrowserMockup>,
    );
    expect(screen.getByText('https://example.com/path')).toBeInTheDocument();
    expect(screen.getByText('Stage content')).toBeInTheDocument();
  });

  it('falls back for empty and invalid URLs', () => {
    const { rerender } = render(
      <BrowserMockup url="">
        <span>child</span>
      </BrowserMockup>,
    );
    expect(screen.getByText('about:blank')).toBeInTheDocument();

    rerender(
      <BrowserMockup url="not a url" isEmbed isFluid>
        <span>child</span>
      </BrowserMockup>,
    );
    expect(screen.getByText('not a url')).toBeInTheDocument();
  });
});
