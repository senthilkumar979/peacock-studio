import { describe, expect, it } from 'vitest';
import type { ClickEvent, InputEvent, PageViewEvent } from '../types/events';
import { extractElementSnapshot } from './extractElementSnapshot';
import { enrichStepFromEvent, generateStepDescription, generateStepTitle } from './stepDescription';

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
});
