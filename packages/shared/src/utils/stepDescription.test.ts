import { describe, expect, it } from 'vitest';
import type { ClickEvent, InputEvent } from '../types/events';
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
      'Click on Save and Close button to save the form.'
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
      'Enter "Tamil Nadu" for State inside the provided country India.'
    );
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

    expect(generateStepTitle(snapshot, event)).toBe('Select Country');
    expect(generateStepDescription(snapshot, event)).toBe('Select "India" for Country.');
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
    expect(generateStepDescription(snapshot, event)).toContain('Choose');
  });
});
