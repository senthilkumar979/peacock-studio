import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/components/extension/ChromeWebStoreLink', () => ({
  ChromeWebStoreLink: () => <a href="https://example.com">Chrome Web Store</a>,
}));

vi.mock('./exampleFlowDoc', async () => {
  const actual = await vi.importActual<typeof import('./exampleFlowDoc')>('./exampleFlowDoc');
  return {
    ...actual,
    getLandingExampleEmbedPath: () => 'about:blank',
    getLandingExampleSharePath: () => '/examples/kachabazar',
    prefetchLandingExampleEmbed: () => undefined,
  };
});

import { HeroSection } from './HeroSection';
import { ProblemSection } from './ProblemSection';
import { SolutionSection } from './SolutionSection';
import { FeaturesSection } from './FeaturesSection';
import { WorkflowSection } from './WorkflowSection';
import { FAQSection } from './FAQSection';
import { CTASection } from './CTASection';
import { ComparisonSection } from './ComparisonSection';
import { PreviewSection } from './PreviewSection';
import { AutomationSection } from './AutomationSection';
import { PlatformComparisonSection } from './PlatformComparisonSection';
import { ExampleFlowDocSection } from './ExampleFlowDocSection';
import { TestimonialsSection } from './TestimonialsSection';
import { TrustArchitectureSection } from './TrustArchitectureSection';
import { LandingSectionShell } from './LandingSectionShell';

describe('landing sections smoke', () => {
  it('HeroSection', () => {
    render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /system of record for how work actually happens/i }),
    ).toBeInTheDocument();
  });

  it('ProblemSection', () => {
    render(<ProblemSection />);
    expect(
      screen.getByRole('heading', { name: /product teams lose hours/i }),
    ).toBeInTheDocument();
  });

  it('SolutionSection', () => {
    render(
      <MemoryRouter>
        <SolutionSection />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /one capture pipeline/i }),
    ).toBeInTheDocument();
  });

  it('FeaturesSection', () => {
    render(<FeaturesSection />);
    expect(
      screen.getByRole('heading', { name: /everything in the product, mapped to outcomes/i }),
    ).toBeInTheDocument();
  });

  it('WorkflowSection', () => {
    render(<WorkflowSection />);
    expect(
      screen.getByRole('heading', { name: /from browser recording to shareable tour/i }),
    ).toBeInTheDocument();
  });

  it('FAQSection', () => {
    render(<FAQSection />);
    expect(
      screen.getByRole('heading', { name: /questions teams ask/i }),
    ).toBeInTheDocument();
  });

  it('CTASection', () => {
    render(
      <MemoryRouter>
        <CTASection />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /your next great demo/i }),
    ).toBeInTheDocument();
  });

  it('ComparisonSection', () => {
    render(<ComparisonSection />);
    expect(
      screen.getByRole('heading', { name: /built for structured workflow capture/i }),
    ).toBeInTheDocument();
  });

  it('PreviewSection', () => {
    render(
      <MemoryRouter>
        <PreviewSection />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /see the actual surfaces/i }),
    ).toBeInTheDocument();
  });

  it('AutomationSection', () => {
    render(<AutomationSection />);
    expect(
      screen.getByRole('heading', { name: /less manual work built into every capture/i }),
    ).toBeInTheDocument();
  });

  it('PlatformComparisonSection', () => {
    render(
      <MemoryRouter>
        <PlatformComparisonSection />
      </MemoryRouter>,
    );
    expect(screen.getByText(/peacock vs traditional knowledge platforms/i)).toBeInTheDocument();
  });

  it('ExampleFlowDocSection', () => {
    render(
      <MemoryRouter>
        <ExampleFlowDocSection />
      </MemoryRouter>,
    );
    expect(screen.getByText(/try a real interactive guide/i)).toBeInTheDocument();
    expect(screen.getByTitle('KachaBazar - eCommerce')).toHaveAttribute('loading', 'eager');
  });

  it('TestimonialsSection', () => {
    render(<TestimonialsSection />);
    expect(
      screen.getByRole('heading', { name: /what teams are saying/i }),
    ).toBeInTheDocument();
  });

  it('TrustArchitectureSection', () => {
    render(<TrustArchitectureSection />);
    expect(
      screen.getByRole('heading', { name: /built for speed, structure, and trustworthy/i }),
    ).toBeInTheDocument();
  });

  it('LandingSectionShell', () => {
    render(
      <LandingSectionShell id="test" tone="light" eyebrow="Eyebrow" title="Shell Title">
        <p>Child content</p>
      </LandingSectionShell>,
    );
    expect(screen.getByRole('heading', { name: /shell title/i })).toBeInTheDocument();
    expect(screen.getByText(/child content/i)).toBeInTheDocument();
  });
});
