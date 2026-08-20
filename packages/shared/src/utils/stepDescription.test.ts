import { describe, expect, it, vi } from 'vitest';
import type { ClickEvent, InputEvent, PageViewEvent } from '../types/events';
import { extractElementSnapshot } from './extractElementSnapshot';
import { enrichStepFromEvent, generateStepDescription, generateStepTitle } from './stepDescription';
import * as stepDescriptionLabels from './stepDescriptionLabels';

describe('stepDescription', () => {
  it('describes a form submit button click', () => {
    document.body.innerHTML = `
      <form name="orderForm">
        <button name="form-submit" type="submit">Save &amp; Close</button>
      </form>
    `;

    const button = document.querySelector('button') as HTMLButtonElement;
    const snapshot = extractElementSnapshot(button);
    const event: ClickEvent = {
      id: '1',
      type: 'click',
      timestamp: Date.now(),
      url: 'https://example.com',
      title: 'Order',
      viewport: { width: 1920, height: 1080, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 0, y: 0, xPercent: 0, yPercent: 0 },
      element: snapshot,
      screenshotId: 'shot-1',
    };

    expect(generateStepTitle(snapshot, event)).toBe('Click Save and Close');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Order page, click Save and Close to save the form.',
    );
  });

  it('describes a text input with country context on parent', () => {
    document.body.innerHTML = `
      <div data-country="India">
        <label for="state-input">State</label>
        <input id="state-input" type="text" name="State" value="Tamil Nadu" />
      </div>
    `;

    const input = document.querySelector('input') as HTMLInputElement;
    const snapshot = extractElementSnapshot(input);
    const event: InputEvent = {
      id: '2',
      type: 'input',
      timestamp: Date.now(),
      url: 'https://example.com',
      title: 'Address',
      element: snapshot,
      valuePreview: 'Tamil Nadu',
      screenshotId: 'shot-2',
    };

    expect(generateStepTitle(snapshot, event)).toBe('Enter Tamil Nadu in State');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Address page, enter Tamil Nadu in the State field (Country: India).',
    );
  });

  it('describes a select field', () => {
    document.body.innerHTML = `
      <label for="country-select">Country</label>
      <select id="country-select" name="country">
        <option value="in" selected>India</option>
      </select>
    `;

    const select = document.querySelector('select') as HTMLSelectElement;
    const snapshot = extractElementSnapshot(select);
    const event: InputEvent = {
      id: '3',
      type: 'input',
      timestamp: Date.now(),
      url: 'https://example.com',
      title: 'Form',
      element: snapshot,
      valuePreview: 'India',
      screenshotId: 'shot-3',
    };

    expect(generateStepTitle(snapshot, event)).toBe('Select India for Country');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Form page, select India from the Country dropdown.',
    );
  });

  it('describes a radio option', () => {
    document.body.innerHTML = `
      <label><input type="radio" name="plan" value="pro" checked /> Pro plan</label>
    `;

    const radio = document.querySelector('input') as HTMLInputElement;
    const snapshot = extractElementSnapshot(radio);
    const event: InputEvent = {
      id: '4',
      type: 'input',
      timestamp: Date.now(),
      url: 'https://example.com',
      title: 'Plans',
      element: snapshot,
      valuePreview: 'pro',
      screenshotId: 'shot-4',
    };

    expect(generateStepTitle(snapshot, event)).toBe('Select Pro plan');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Plans page, select Pro plan.',
    );
  });

  it('describes a short input label without awkward value phrasing', () => {
    document.body.innerHTML = `
      <label for="to-field">To</label>
      <input id="to-field" type="text" value="62" />
    `;

    const input = document.querySelector('input') as HTMLInputElement;
    const snapshot = extractElementSnapshot(input);
    const event: InputEvent = {
      id: '5',
      type: 'input',
      timestamp: Date.now(),
      url: 'https://example.com',
      title: 'Filters',
      element: snapshot,
      valuePreview: '62',
      screenshotId: 'shot-5',
    };

    expect(generateStepTitle(snapshot, event)).toBe('Enter 62 in To');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Filters page, enter 62 in the To field.',
    );
  });

  it('describes a checkbox with clean wording', () => {
    document.body.innerHTML = `
      <label>
        <input type="checkbox" checked value="Furniture 24" />
        Furniture 24
      </label>
    `;

    const checkbox = document.querySelector('input') as HTMLInputElement;
    const snapshot = extractElementSnapshot(checkbox);
    const event: InputEvent = {
      id: '6',
      type: 'input',
      timestamp: Date.now(),
      url: 'https://example.com',
      title: 'Inventory',
      element: snapshot,
      valuePreview: 'Furniture 24',
      screenshotId: 'shot-6',
    };

    expect(generateStepTitle(snapshot, event)).toBe('Check Furniture 24');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Inventory page, check Furniture 24.',
    );
  });

  it('describes an unchecked checkbox', () => {
    document.body.innerHTML = `
      <label>
        <input type="checkbox" value="Furniture 24" />
        Furniture 24
      </label>
    `;

    const checkbox = document.querySelector('input') as HTMLInputElement;
    const snapshot = extractElementSnapshot(checkbox);
    const event: InputEvent = {
      id: '6b',
      type: 'input',
      timestamp: Date.now(),
      url: 'https://example.com',
      title: 'Inventory',
      element: snapshot,
      valuePreview: '',
      screenshotId: 'shot-6b',
    };

    expect(generateStepTitle(snapshot, event)).toBe('Uncheck Furniture 24');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Inventory page, uncheck Furniture 24.',
    );
  });

  it('describes an enter-key submit step', () => {
    document.body.innerHTML = `<form id="signup-form" name="signupForm"><input name="email" /></form>`;
    const form = document.querySelector('form') as HTMLFormElement;
    const snapshot = extractElementSnapshot(form);
    const event = {
      id: 'submit-1',
      type: 'submit' as const,
      timestamp: Date.now(),
      url: 'https://example.com',
      title: 'Sign up',
      viewport: { width: 1440, height: 900, scrollX: 0, scrollY: 0, dpr: 1 },
      element: snapshot,
      trigger: 'enter-key' as const,
      screenshotId: 'shot-submit',
    };

    expect(generateStepTitle(snapshot, event)).toBe('Submit signupForm');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Sign up page, press Enter to submit signupForm.',
    );
  });

  it('describes a link click', () => {
    document.body.innerHTML = `<a href="/settings">Account settings</a>`;

    const link = document.querySelector('a') as HTMLAnchorElement;
    const snapshot = extractElementSnapshot(link);
    const event: ClickEvent = {
      id: '7',
      type: 'click',
      timestamp: Date.now(),
      url: 'https://example.com/home',
      title: 'Home',
      viewport: { width: 1440, height: 900, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 0, y: 0, xPercent: 0, yPercent: 0 },
      element: snapshot,
      screenshotId: 'shot-7',
    };

    expect(generateStepTitle(snapshot, event)).toBe('Open Account settings');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Home page, open Account settings.',
    );
  });

  it('describes an empty text input', () => {
    document.body.innerHTML = `
      <label for="email">Email address</label>
      <input id="email" type="email" value="" />
    `;

    const input = document.querySelector('input') as HTMLInputElement;
    const snapshot = extractElementSnapshot(input);
    const event: InputEvent = {
      id: '8',
      type: 'input',
      timestamp: Date.now(),
      url: 'https://example.com/signup',
      title: 'Sign up',
      element: snapshot,
      valuePreview: '',
      screenshotId: 'shot-8',
    };

    expect(generateStepTitle(snapshot, event)).toBe('Fill in Email address');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Sign up page, enter a value in the Email address field.',
    );
  });

  it('describes a page view with title', () => {
    const event: PageViewEvent = {
      id: '9',
      type: 'page-view',
      timestamp: Date.now(),
      url: 'https://example.com/checkout/review',
      title: 'Checkout Review',
      viewport: { width: 1440, height: 900, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: 'shot-9',
    };

    expect(generateStepTitle({} as never, event)).toBe('Open Checkout Review');
    expect(generateStepDescription({} as never, event)).toBe(
      'Open the Checkout Review page.',
    );
  });

  it('describes a navigation redirect page view', () => {
    const event: PageViewEvent = {
      id: '10',
      type: 'page-view',
      timestamp: Date.now(),
      url: 'https://example.com/dashboard',
      title: 'Dashboard',
      viewport: { width: 1440, height: 900, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: 'shot-10',
      navigationRedirect: true,
    };

    expect(generateStepTitle({} as never, event)).toBe('User navigates to Dashboard page');
    expect(generateStepDescription({} as never, event)).toBe(
      'After previous action, page is redirected to Dashboard',
    );
  });

  it('stores generated copy separately from user notes', () => {
    const event: PageViewEvent = {
      id: '11',
      type: 'page-view',
      timestamp: Date.now(),
      url: 'https://example.com/start',
      title: 'Start',
      viewport: { width: 1440, height: 900, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: 'shot-11',
    };

    const step = {
      title: '',
      notes: 'existing notes',
      generatedTitle: '',
      generatedDescription: '',
    };

    enrichStepFromEvent(step, event);

    expect(step.generatedTitle).toBe('Open Start');
    expect(step.generatedDescription).toBe('Open the Start page.');
    expect(step.title).toBe('Open Start');
    expect(step.notes).toBe('');
  });

  it('describes a listbox option', () => {
    document.body.innerHTML =
      '<div role="option" aria-label="Large">Large</div>';
    const option = document.querySelector('[role="option"]') as HTMLDivElement;
    const snapshot = extractElementSnapshot(option);
    const event: ClickEvent = {
      id: '1',
      type: 'click',
      timestamp: Date.now(),
      url: 'https://example.com',
      title: 'Shop',
      viewport: { width: 1440, height: 900, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 0, y: 0, xPercent: 0, yPercent: 0 },
      element: snapshot,
      screenshotId: 'shot',
    };

    expect(generateStepTitle(snapshot, event)).toBe('Select Large');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Shop page, choose an option from the Large dropdown.',
    );
  });

  it('describes a tab click', () => {
    document.body.innerHTML = '<div role="tab" aria-label="Shipping">Shipping</div>';
    const tab = document.querySelector('[role="tab"]') as HTMLDivElement;
    const snapshot = extractElementSnapshot(tab);
    const event: ClickEvent = {
      id: '1',
      type: 'click',
      timestamp: Date.now(),
      url: 'https://example.com',
      title: 'Checkout',
      viewport: { width: 1440, height: 900, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 0, y: 0, xPercent: 0, yPercent: 0 },
      element: snapshot,
      screenshotId: 'shot',
    };

    expect(generateStepTitle(snapshot, event)).toBe('Switch to Shipping');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Checkout page, switch to the Shipping tab.',
    );
  });

  it('describes contenteditable input', () => {
    document.body.innerHTML =
      '<label for="notes">Notes</label><div id="notes" contenteditable="true" role="textbox">Line one</div>';
    const editor = document.querySelector('#notes') as HTMLDivElement;
    const snapshot = extractElementSnapshot(editor);
    const event: InputEvent = {
      id: '1',
      type: 'input',
      timestamp: Date.now(),
      url: 'https://example.com',
      title: 'Form',
      viewport: { width: 1440, height: 900, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 0, y: 0, xPercent: 0, yPercent: 0 },
      element: snapshot,
      valuePreview: 'Line one',
      screenshotId: 'shot',
    };

    expect(generateStepTitle(snapshot, event)).toBe('Enter Line one in notes');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Form page, enter Line one in the notes field.',
    );
  });

  it('describes menuitem, combobox, and generic controls', () => {
    document.body.innerHTML = '<div role="menuitem">Delete</div>';
    const menu = extractElementSnapshot(document.querySelector('[role="menuitem"]') as HTMLElement);
    const menuEvent: ClickEvent = {
      id: '1',
      type: 'click',
      timestamp: 1,
      url: 'https://example.com',
      title: 'App',
      viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 0, y: 0, xPercent: 0, yPercent: 0 },
      element: menu,
      screenshotId: 'shot',
    };
    expect(generateStepDescription(menu, menuEvent)).toContain('Delete');
    expect(generateStepTitle(menu, menuEvent)).toContain('Delete');

    document.body.innerHTML = '<input role="combobox" aria-label="City" value="Paris" />';
    const combo = extractElementSnapshot(document.querySelector('input') as HTMLElement);
    const comboEvent: InputEvent = {
      id: '2',
      type: 'input',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Form',
      viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 0, y: 0, xPercent: 0, yPercent: 0 },
      element: combo,
      valuePreview: 'Paris',
      screenshotId: 'shot',
    };
    expect(generateStepDescription(combo, comboEvent)).toContain('City');
    expect(generateStepTitle(combo, comboEvent)).toContain('City');

    document.body.innerHTML = '<div id="chip">Status</div>';
    const generic = extractElementSnapshot(document.querySelector('#chip') as HTMLElement);
    const genericEvent: ClickEvent = {
      id: '3',
      type: 'click',
      timestamp: 1,
      url: 'https://example.com',
      title: 'App',
      viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 0, y: 0, xPercent: 0, yPercent: 0 },
      element: generic,
      screenshotId: 'shot',
    };
    expect(generateStepDescription(generic, genericEvent)).toContain('Status');
    expect(generateStepTitle(generic, genericEvent)).toContain('Status');
  });

  it('enriches navigation steps without element snapshots', () => {
    const step = {
      title: '',
      notes: 'keep',
      generatedTitle: '',
      generatedDescription: '',
    };
    enrichStepFromEvent(step, {
      id: '1',
      type: 'navigation',
      timestamp: 1,
      fromUrl: 'https://a.com',
      toUrl: 'https://b.com',
    });
    expect(step.generatedTitle.length).toBeGreaterThan(0);
    expect(step.notes).toBe('');
    expect(step.title).toBe(step.generatedTitle);
  });

  it('describes navigation with empty and invalid urls', () => {
    expect(
      generateStepDescription({} as never, {
        id: '1',
        type: 'navigation',
        timestamp: 1,
        fromUrl: '',
        toUrl: 'not-a-url',
      }),
    ).toBe('Navigate from the previous page to not-a-url.');
    expect(generateStepTitle({} as never, { id: '1', type: 'navigation', timestamp: 1, fromUrl: 'https://a.com', toUrl: 'https://b.com' })).toBe('Go to next page');
  });

  it('uses submit title fallbacks from form metadata', () => {
    document.body.innerHTML = '<form aria-label="Signup"><input name="email" /></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    const snapshot = extractElementSnapshot(form);
    const event = {
      id: '1',
      type: 'submit' as const,
      timestamp: 1,
      url: 'https://example.com',
      title: 'Signup',
      viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
      element: snapshot,
      trigger: 'enter-key' as const,
      screenshotId: 'shot',
    };
    expect(generateStepTitle(snapshot, event)).toBe('Submit Signup');
    expect(generateStepDescription(snapshot, event)).toContain('the form');
  });

  it('unchecks checkbox clicks when control kind is checkbox but flag is false', () => {
    const element = extractElementSnapshot(document.createElement('div'));
    const unchecked = {
      ...element,
      isCheckbox: false,
      label: { ...element.label, text: 'Terms' },
    };
    vi.spyOn(stepDescriptionLabels, 'getControlKind').mockReturnValue('checkbox');
    const event: ClickEvent = {
      id: '1',
      type: 'click',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Form',
      viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 0, y: 0, xPercent: 0, yPercent: 0 },
      element: unchecked,
      screenshotId: 'shot',
    };
    expect(generateStepTitle(unchecked, event)).toBe('Uncheck Terms');
    vi.restoreAllMocks();
  });

  it('enriches click steps with element snapshots', () => {
    document.body.innerHTML = '<button>Continue</button>';
    const button = document.querySelector('button') as HTMLButtonElement;
    const element = extractElementSnapshot(button);
    const step = {
      title: '',
      notes: 'notes',
      generatedTitle: '',
      generatedDescription: '',
    };
    enrichStepFromEvent(step, {
      id: '1',
      type: 'click',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Home',
      viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 0, y: 0, xPercent: 0, yPercent: 0 },
      element,
      screenshotId: 'shot',
    });
    expect(step.generatedTitle).toContain('Continue');
    expect(step.notes).toBe('');
  });

  it('describes page views without titles and empty selects', () => {
    expect(
      generateStepTitle({} as never, {
        id: '1',
        type: 'page-view',
        timestamp: 1,
        url: 'https://example.com',
        title: '  ',
        viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
        screenshotId: 'shot',
        navigationRedirect: true,
      }),
    ).toBe('User navigates to the new page page');

    document.body.innerHTML = '<select id="country" aria-label="Country"></select>';
    const select = document.querySelector('select') as HTMLSelectElement;
    const element = extractElementSnapshot(select);
    const event: InputEvent = {
      id: '1',
      type: 'input',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Form',
      element,
      valuePreview: '',
      screenshotId: 'shot',
    };
    expect(generateStepTitle(element, event)).toBe('Select Country');
    expect(generateStepDescription(element, event)).toContain('choose an option');
  });
});
