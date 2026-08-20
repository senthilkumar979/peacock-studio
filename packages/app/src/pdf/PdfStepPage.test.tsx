import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ElementSnapshot, FlowStep, StepResource } from '@peacock/shared';
import type { PdfStepContentSlice } from './pdfStepLayout';

vi.mock('@react-pdf/renderer', async () => import('./reactPdfTestMock'));

import { PdfStepPage } from './PdfStepPage';

const element: ElementSnapshot = {
  tagName: 'button',
  type: 'button',
  id: '',
  name: null,
  role: null,
  classes: [],
  selector: 'button',
  xpath: '//button',
  innerText: 'Submit',
  innerHTML: null,
  label: {
    text: 'Submit',
    htmlFor: null,
    ariaLabel: null,
    ariaLabelledBy: null,
    placeholder: null,
  },
  valuePreview: null,
  classification: 'public',
  maskedValue: null,
  dataAttributes: {},
  ariaDescription: null,
  parent: null,
  grandparent: null,
  isButton: true,
  isLink: false,
  isInput: false,
  isSelect: false,
  isCheckbox: false,
  isRadio: false,
  isOption: false,
  isTab: false,
  isMenuItem: false,
  isCombobox: false,
  isContentEditable: false,
};

const resources: StepResource[] = [
  {
    id: 'r1',
    documentId: 'doc-1',
    stepId: 'step-1',
    url: 'https://docs.example.com/help',
    sortOrder: 0,
    createdAt: 1,
  },
];

function makeSlice(overrides: Partial<PdfStepContentSlice> = {}): PdfStepContentSlice {
  return {
    instructions: 'Click Submit',
    detailedDescription: 'Confirm the form values first.',
    resources,
    showScreenshot: true,
    pageIndex: 0,
    pageCount: 1,
    ...overrides,
  };
}

function makeClickStep(overrides?: {
  title?: string;
  screenshotId?: string;
}): FlowStep {
  return {
    id: 'step-1',
    title: overrides?.title ?? 'Submit expense',
    notes: 'Click Submit',
    generatedTitle: 'Submit expense',
    generatedDescription: '',
    screenshotId: overrides?.screenshotId ?? 'shot-1',
    event: {
      id: 'ev-1',
      type: 'click',
      timestamp: 1,
      url: 'https://app.example.com/expenses',
      title: 'Expenses',
      viewport: { width: 1000, height: 500, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 0.5, y: 0.25, xPercent: 0.5, yPercent: 0.25 },
      element,
      screenshotId: overrides?.screenshotId ?? 'shot-1',
    },
  };
}

function makePageViewStep(): FlowStep {
  return {
    id: 'step-2',
    title: 'Open dashboard',
    notes: '',
    generatedTitle: 'Open dashboard',
    generatedDescription: '',
    screenshotId: 'shot-2',
    event: {
      id: 'ev-2',
      type: 'page-view',
      timestamp: 2,
      url: 'https://app.example.com/dashboard',
      title: 'Dashboard',
      viewport: { width: 800, height: 600, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: 'shot-2',
    },
  };
}

describe('PdfStepPage', () => {
  it('renders instructions, resources, screenshot, and click marker', () => {
    render(
      <PdfStepPage
        step={makeClickStep()}
        stepNumber={3}
        flowTitle="Expense flow"
        screenshotUrls={{ 'shot-1': 'https://cdn.example.com/shot-1.png' }}
        logoSrc="https://example.com/logo.png"
        slice={makeSlice()}
        resources={resources}
      />,
    );

    expect(screen.getByText('Expense flow')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
    expect(screen.getByText('Submit expense')).toBeInTheDocument();
    expect(screen.getByText('https://app.example.com/expenses')).toBeInTheDocument();
    expect(screen.getByText('Instruction')).toBeInTheDocument();
    expect(screen.getByText('Click Submit')).toBeInTheDocument();
    expect(screen.getByText('Detailed description')).toBeInTheDocument();
    expect(screen.getByText('Confirm the form values first.')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('docs.example.com/help')).toBeInTheDocument();

    const screenshot = screen
      .getAllByTestId('pdf-image')
      .find((node) => node.getAttribute('data-src') === 'https://cdn.example.com/shot-1.png');
    expect(screenshot).toBeTruthy();
    expect(screenshot?.getAttribute('data-style')).toContain('"width":503');
    expect(screenshot?.getAttribute('data-style')).toContain('"height":252');
  });

  it('shows continuation badge and hides resources on later slices', () => {
    render(
      <PdfStepPage
        step={makePageViewStep()}
        stepNumber={1}
        flowTitle="Expense flow"
        screenshotUrls={{ 'shot-2': 'https://cdn.example.com/shot-2.png' }}
        logoSrc="https://example.com/logo.png"
        slice={makeSlice({
          pageIndex: 1,
          pageCount: 3,
          instructions: '',
          detailedDescription: '',
          resources: [],
        })}
        resources={resources}
      />,
    );

    expect(screen.getByText('Step 1 (2/3)')).toBeInTheDocument();
    expect(screen.queryByText('Resources')).not.toBeInTheDocument();
    expect(
      screen
        .getAllByTestId('pdf-image')
        .some((node) => node.getAttribute('data-src') === 'https://cdn.example.com/shot-2.png'),
    ).toBe(true);
  });

  it('renders screenshot without layout when viewport is missing', () => {
    const step: FlowStep = {
      id: 'step-nav',
      title: 'Navigate away',
      notes: '',
      generatedTitle: '',
      generatedDescription: '',
      screenshotId: 'shot-nav',
      event: {
        id: 'ev-nav',
        type: 'navigation',
        timestamp: 3,
        fromUrl: 'https://app.example.com/prev',
        toUrl: 'https://app.example.com/next',
      },
    };

    render(
      <PdfStepPage
        step={step}
        stepNumber={2}
        flowTitle="Nav flow"
        screenshotUrls={{ 'shot-nav': 'https://cdn.example.com/nav.png' }}
        logoSrc="https://example.com/logo.png"
        slice={makeSlice({
          instructions: '',
          detailedDescription: '',
          resources: [],
        })}
        resources={[]}
      />,
    );

    expect(
      screen
        .getAllByTestId('pdf-image')
        .some((node) => node.getAttribute('data-src') === 'https://cdn.example.com/nav.png'),
    ).toBe(true);
    expect(screen.queryByText('Screenshot not available')).not.toBeInTheDocument();
  });

  it('shows placeholder when screenshot is unavailable', () => {
    render(
      <PdfStepPage
        step={makePageViewStep()}
        stepNumber={4}
        flowTitle="Dashboard flow"
        screenshotUrls={{}}
        logoSrc="https://example.com/logo.png"
        slice={makeSlice({
          showScreenshot: true,
          instructions: '',
          detailedDescription: '',
          resources: [],
        })}
        resources={[]}
      />,
    );

    expect(screen.getByText('Screenshot not available')).toBeInTheDocument();
  });

  it('skips screenshot when slice disables it', () => {
    render(
      <PdfStepPage
        step={makeClickStep()}
        stepNumber={1}
        flowTitle="Expense flow"
        screenshotUrls={{ 'shot-1': 'https://cdn.example.com/shot-1.png' }}
        logoSrc="https://example.com/logo.png"
        slice={makeSlice({ showScreenshot: false, resources: [] })}
        resources={[]}
      />,
    );

    expect(screen.getByText('Screenshot not available')).toBeInTheDocument();
    expect(
      screen
        .getAllByTestId('pdf-image')
        .some((node) => node.getAttribute('data-src') === 'https://cdn.example.com/shot-1.png'),
    ).toBe(false);
  });

  it('omits step URL when empty', () => {
    const step = makeClickStep();
    if (step.event.type === 'click') {
      step.event = { ...step.event, url: '' };
    }

    render(
      <PdfStepPage
        step={step}
        stepNumber={1}
        flowTitle="Expense flow"
        screenshotUrls={{}}
        logoSrc="https://example.com/logo.png"
        slice={makeSlice({
          showScreenshot: false,
          instructions: '',
          detailedDescription: '',
          resources: [],
        })}
        resources={[]}
      />,
    );

    expect(screen.getByText('Submit expense')).toBeInTheDocument();
    expect(screen.queryByText('https://app.example.com/expenses')).not.toBeInTheDocument();
  });
});
