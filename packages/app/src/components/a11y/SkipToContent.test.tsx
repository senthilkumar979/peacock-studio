import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipToContent } from './SkipToContent';

describe('SkipToContent', () => {
  it('renders a skip link to main content', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).toHaveAttribute('href', '#main-content');
  });
});
