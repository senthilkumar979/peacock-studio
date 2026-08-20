import { describe, expect, it } from 'vitest';
import type { ElementSnapshot, FlowOutlineItem, FlowStep } from '../../types/events';
import { generatePlaywrightSpec } from './generatePlaywrightSpec';

const baseElement: ElementSnapshot = {
  tagName: 'input',
  type: 'text',
  id: 'email',
  name: 'email',
  role: null,
  classes: [],
  selector: '#email',
  xpath: '//input',
  innerText: '',
  innerHTML: null,
  label: {
    text: 'Email',
    htmlFor: 'email',
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
  isButton: false,
  isLink: false,
  isInput: true,
  isSelect: false,
  isCheckbox: false,
  isRadio: false,
  isOption: false,
  isTab: false,
  isMenuItem: false,
  isCombobox: false,
  isContentEditable: false,
};

function inputStep(valuePreview: string, overrides: Partial<ElementSnapshot> = {}): FlowStep {
  return {
    id: 'step-1',
    title: '',
    notes: '',
    generatedTitle: 'Enter hello in Email',
    generatedDescription: '',
    screenshotId: 'shot-1',
    event: {
      id: 'event-1',
      type: 'input',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Form',
      element: { ...baseElement, ...overrides },
      valuePreview,
      screenshotId: 'shot-1',
    },
  };
}

describe('generatePlaywrightSpec', () => {
  it('uses event.valuePreview for fill statements', () => {
    const spec = generatePlaywrightSpec('Flow', [inputStep('hello')]);
    expect(spec).toContain(".fill('hello')");
  });

  it('skips when there are no playable steps', () => {
    const spec = generatePlaywrightSpec("O'Brien", []);
    expect(spec).toContain("test.describe('O\\'Brien'");
    expect(spec).toContain("test.skip(true, 'No playable steps in this flow.')");
  });

  it('emits navigation, checkbox, submit, click, and section comments', () => {
    const outline: FlowOutlineItem[] = [
      { id: 'sec-1', kind: 'section', title: '  ', description: '' },
      {
        id: 'nav-1',
        title: '',
        notes: '',
        generatedTitle: 'Navigate',
        generatedDescription: '',
        screenshotId: '',
        event: {
          id: 'e-nav',
          type: 'navigation',
          timestamp: 1,
          fromUrl: 'https://example.com/a',
          toUrl: 'https://example.com/b',
        },
      },
      {
        id: 'pv-empty',
        title: '',
        notes: '',
        generatedTitle: 'Empty page',
        generatedDescription: '',
        screenshotId: 'shot-pv',
        event: {
          id: 'e-pv',
          type: 'page-view',
          timestamp: 2,
          url: '   ',
          title: 'Blank',
          viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
          screenshotId: 'shot-pv',
        },
      },
      { ...inputStep('checked', { isCheckbox: true, isInput: false }), id: 'check-1' },
      {
        ...inputStep('', { isRadio: true, isInput: false, isCheckbox: false }),
        id: 'radio-1',
        generatedTitle: 'Uncheck',
      },
      {
        ...inputStep('••••'),
        id: 'secret-1',
        generatedTitle: 'Secret',
      },
      {
        id: 'submit-1',
        title: '',
        notes: '',
        generatedTitle: 'Submit',
        generatedDescription: '',
        screenshotId: 'shot-s',
        event: {
          id: 'e-s',
          type: 'submit',
          timestamp: 3,
          url: 'https://example.com',
          title: 'Form',
          viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
          element: { ...baseElement, isButton: true, isInput: false, tagName: 'button' },
          trigger: 'enter-key',
          screenshotId: 'shot-s',
        },
      },
      {
        id: 'click-1',
        title: '',
        notes: '',
        generatedTitle: 'Click go',
        generatedDescription: '',
        screenshotId: 'shot-c',
        event: {
          id: 'e-c',
          type: 'click',
          timestamp: 4,
          url: 'https://example.com',
          title: 'Home',
          viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
          position: { x: 0.5, y: 0.5, xPercent: 50, yPercent: 50 },
          element: {
            ...baseElement,
            isButton: true,
            isInput: false,
            tagName: 'button',
            selector: 'button',
          },
          screenshotId: 'shot-c',
        },
      },
      {
        id: 'branch-1',
        kind: 'branch',
        title: 'Skip me',
        description: '',
        paths: [],
      },
    ];

    const spec = generatePlaywrightSpec('Checkout', outline);
    expect(spec).toContain('// Section: Section');
    expect(spec).toContain("await page.goto('https://example.com/b');");
    expect(spec).toContain("await page.waitForLoadState('networkidle');");
    expect(spec).toContain('.check();');
    expect(spec).toContain('.uncheck();');
    expect(spec).toContain("fill(process.env.PEACOCK_INPUT ?? '')");
    expect(spec).toContain(".press('Enter');");
    expect(spec).toContain('.click();');
  });

  it('falls back to example.com when no usable urls exist', () => {
    const outline: FlowOutlineItem[] = [
      {
        id: 'step-1',
        title: '',
        notes: '',
        generatedTitle: 'Blank nav',
        generatedDescription: '',
        screenshotId: '',
        event: {
          id: 'e1',
          type: 'navigation',
          timestamp: 1,
          fromUrl: '',
          toUrl: '   ',
        },
      },
    ];

    const spec = generatePlaywrightSpec('Flow', outline);
    expect(spec).toContain("await page.goto('https://example.com');");
    expect(spec).toContain("await page.waitForLoadState('networkidle');");
  });

  it('skips invalid base urls and uses a later valid origin', () => {
    const outline: FlowOutlineItem[] = [
      {
        id: 'bad',
        title: '',
        notes: '',
        generatedTitle: 'Bad',
        generatedDescription: '',
        screenshotId: '',
        event: {
          id: 'e1',
          type: 'navigation',
          timestamp: 1,
          fromUrl: '',
          toUrl: 'not a url',
        },
      },
      {
        id: 'good',
        title: '',
        notes: '',
        generatedTitle: 'Good',
        generatedDescription: '',
        screenshotId: 'shot',
        event: {
          id: 'e2',
          type: 'page-view',
          timestamp: 2,
          url: 'https://app.example.com/home',
          title: 'Home',
          viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
          screenshotId: 'shot',
        },
      },
    ];

    const spec = generatePlaywrightSpec('Flow', outline);
    expect(spec).toContain("await page.goto('not a url');");
    expect(spec).toContain("await page.goto('https://app.example.com/home');");
  });

  it('handles events without url fields when resolving base url', () => {
    const outline: FlowOutlineItem[] = [
      {
        id: 'step-1',
        title: '',
        notes: '',
        generatedTitle: 'Weird',
        generatedDescription: '',
        screenshotId: '',
        event: {
          id: 'e1',
          type: 'navigation',
          timestamp: 1,
          fromUrl: '',
          toUrl: '',
        } as FlowStep['event'],
      },
      {
        id: 'step-2',
        title: '',
        notes: '',
        generatedTitle: 'Click',
        generatedDescription: '',
        screenshotId: 'shot',
        event: {
          id: 'e2',
          type: 'click',
          timestamp: 2,
          url: 'https://example.com',
          title: 'Home',
          viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
          position: { x: 0, y: 0, xPercent: 0, yPercent: 0 },
          element: baseElement,
          screenshotId: 'shot',
        },
      },
    ];

    const spec = generatePlaywrightSpec('Flow', outline);
    expect(spec).toContain("await page.goto('https://example.com');");
  });
});
