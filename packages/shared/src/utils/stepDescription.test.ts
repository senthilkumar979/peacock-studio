import { describe, expect, it } from 'vitest';
import type { ClickEvent, InputEvent, PageViewEvent } from '../types/events';
import { extractElementSnapshot } from './extractElementSnapshot';
import { generateStepDescription, generateStepTitle } from './stepDescription';

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

    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Order page, click the Save and Close button to save the form.'
    );
    expect(generateStepTitle(snapshot, event)).toBe('Click Save and Close');
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

    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Address page, enter value Tamil Nadu in the input field "State" for country India.'
    );
    expect(generateStepTitle(snapshot, event)).toBe('Enter Tamil Nadu in State');
    expect(snapshot.valuePreview).toBe('Tamil Nadu');
    expect(snapshot.label.text).toBe('State');
    expect(snapshot.parent?.dataAttributes.country).toBe('India');
  });

  it('describes a select field with Select wording', () => {
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

    expect(generateStepTitle(snapshot, event)).toBe('Select India in Country');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Form page, select India in the dropdown field "Country".'
    );
  });

  it('describes a radio option with Choose wording', () => {
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

    expect(generateStepTitle(snapshot, event)).toBe('Choose Pro plan');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Plans page, select the option with label "Pro plan".'
    );
  });

  it('describes a short input label with clearer field wording', () => {
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

    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Filters page, enter value 62 in the input field "To".'
    );
  });

  it('describes a checkbox using the label text only once', () => {
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

    expect(generateStepTitle(snapshot, event)).toBe('Mark Furniture 24');
    expect(generateStepDescription(snapshot, event)).toBe(
      'On the Inventory page, mark the checkbox with label "Furniture 24".'
    );
  });

  it('describes a page view with title and url', () => {
    const event: PageViewEvent = {
      id: '7',
      type: 'page-view',
      timestamp: Date.now(),
      url: 'https://example.com/checkout/review',
      title: 'Checkout Review',
      viewport: { width: 1440, height: 900, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: 'shot-7',
    };

    expect(generateStepTitle({} as never, event)).toBe('Open Checkout Review');
    expect(generateStepDescription({} as never, event)).toBe(
      'Open Checkout Review at https://example.com/checkout/review.'
    );
  });
});
