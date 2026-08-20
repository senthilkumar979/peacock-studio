import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LegalSectionCard } from './LegalSectionCard';

describe('LegalSectionCard', () => {
  it('renders heading, paragraphs, and bullets with section id', () => {
    const { container } = render(
      <LegalSectionCard
        index={0}
        section={{
          heading: 'Data Retention',
          paragraphs: ['We keep data as needed.'],
          bullets: ['Local storage', 'Cloud sync'],
        }}
      />,
    );
    expect(screen.getByRole('heading', { name: /data retention/i })).toBeInTheDocument();
    expect(screen.getByText(/we keep data as needed/i)).toBeInTheDocument();
    expect(screen.getByText(/local storage/i)).toBeInTheDocument();
    expect(container.querySelector('#data-retention')).toBeTruthy();
  });
});
