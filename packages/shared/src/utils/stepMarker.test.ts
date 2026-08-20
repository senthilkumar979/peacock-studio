import { describe, expect, it } from 'vitest';
import type { ElementSnapshot, FlowStep } from '../types/events';
import { getStepMarkerPosition, getStepViewport } from './stepMarker';

const viewport = { width: 1280, height: 720, scrollX: 0, scrollY: 10, dpr: 1 };
const position = { x: 0.2, y: 0.4, xPercent: 20, yPercent: 40 };

const element: ElementSnapshot = {
  tagName: 'button',
  type: 'button',
  id: '',
  name: null,
  role: null,
  classes: [],
  selector: 'button',
  xpath: '//button',
  innerText: 'Go',
  innerHTML: null,
  label: {
    text: 'Go',
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

function makeStep(event: FlowStep['event']): FlowStep {
  return {
    id: 'step-1',
    event,
    title: '',
    notes: '',
    generatedTitle: '',
    generatedDescription: '',
    screenshotId: 'shot-1',
  };
}

describe('getStepViewport', () => {
  it('returns viewport for click, page-view, and submit', () => {
    expect(
      getStepViewport(
        makeStep({
          id: '1',
          type: 'click',
          timestamp: 1,
          url: 'https://example.com',
          title: 'Home',
          viewport,
          position,
          element,
          screenshotId: 'shot-1',
        }),
      ),
    ).toEqual(viewport);

    expect(
      getStepViewport(
        makeStep({
          id: '1',
          type: 'page-view',
          timestamp: 1,
          url: 'https://example.com',
          title: 'Home',
          viewport,
          screenshotId: 'shot-1',
        }),
      ),
    ).toEqual(viewport);

    expect(
      getStepViewport(
        makeStep({
          id: '1',
          type: 'submit',
          timestamp: 1,
          url: 'https://example.com',
          title: 'Form',
          viewport,
          element,
          trigger: 'enter-key',
          screenshotId: 'shot-1',
        }),
      ),
    ).toEqual(viewport);
  });

  it('returns viewport for input when present, otherwise null', () => {
    const inputElement = { ...element, isButton: false, isInput: true, tagName: 'input', type: 'text' };

    expect(
      getStepViewport(
        makeStep({
          id: '1',
          type: 'input',
          timestamp: 1,
          url: 'https://example.com',
          title: 'Form',
          viewport,
          element: inputElement,
          valuePreview: 'a',
          screenshotId: 'shot-1',
        }),
      ),
    ).toEqual(viewport);

    expect(
      getStepViewport(
        makeStep({
          id: '1',
          type: 'input',
          timestamp: 1,
          url: 'https://example.com',
          title: 'Form',
          element: inputElement,
          valuePreview: 'a',
          screenshotId: 'shot-1',
        }),
      ),
    ).toBeNull();
  });

  it('returns null for navigation', () => {
    expect(
      getStepViewport(
        makeStep({
          id: '1',
          type: 'navigation',
          timestamp: 1,
          fromUrl: 'https://a.com',
          toUrl: 'https://b.com',
        }),
      ),
    ).toBeNull();
  });
});

describe('getStepMarkerPosition', () => {
  it('returns click position', () => {
    expect(
      getStepMarkerPosition(
        makeStep({
          id: '1',
          type: 'click',
          timestamp: 1,
          url: 'https://example.com',
          title: 'Home',
          viewport,
          position,
          element,
          screenshotId: 'shot-1',
        }),
      ),
    ).toEqual(position);
  });

  it('returns optional position for input and submit', () => {
    const inputElement = { ...element, isButton: false, isInput: true, tagName: 'input', type: 'text' };

    expect(
      getStepMarkerPosition(
        makeStep({
          id: '1',
          type: 'input',
          timestamp: 1,
          url: 'https://example.com',
          title: 'Form',
          position,
          element: inputElement,
          valuePreview: 'x',
          screenshotId: 'shot-1',
        }),
      ),
    ).toEqual(position);

    expect(
      getStepMarkerPosition(
        makeStep({
          id: '1',
          type: 'submit',
          timestamp: 1,
          url: 'https://example.com',
          title: 'Form',
          viewport,
          element,
          trigger: 'enter-key',
          screenshotId: 'shot-1',
        }),
      ),
    ).toBeNull();
  });

  it('returns null for page-view', () => {
    expect(
      getStepMarkerPosition(
        makeStep({
          id: '1',
          type: 'page-view',
          timestamp: 1,
          url: 'https://example.com',
          title: 'Home',
          viewport,
          screenshotId: 'shot-1',
        }),
      ),
    ).toBeNull();
  });
});
