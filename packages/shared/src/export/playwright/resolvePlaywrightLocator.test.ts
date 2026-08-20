import { describe, expect, it } from 'vitest';
import type { ElementSnapshot } from '../../types/events';
import { resolvePlaywrightLocator } from './resolvePlaywrightLocator';

function snapshot(overrides: Partial<ElementSnapshot> = {}): ElementSnapshot {
  return {
    tagName: 'div',
    type: null,
    id: '',
    name: null,
    role: null,
    classes: [],
    selector: '',
    xpath: '//div',
    innerText: '',
    innerHTML: null,
    label: {
      text: null,
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
    isButton: false,
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
    ...overrides,
  };
}

describe('resolvePlaywrightLocator', () => {
  it('prefers test id attributes and escapes quotes', () => {
    expect(
      resolvePlaywrightLocator(
        snapshot({ dataAttributes: { testid: "a'b" } }),
      ),
    ).toEqual({
      strategy: 'testId',
      expression: "page.getByTestId('a\\'b')",
    });

    expect(
      resolvePlaywrightLocator(
        snapshot({ dataAttributes: { 'test-id': 'x' } }),
      ).strategy,
    ).toBe('testId');
  });

  it('uses role + accessible name when available', () => {
    expect(
      resolvePlaywrightLocator(
        snapshot({
          isButton: true,
          label: {
            text: 'Save',
            htmlFor: null,
            ariaLabel: null,
            ariaLabelledBy: null,
            placeholder: null,
          },
        }),
      ),
    ).toEqual({
      strategy: 'role',
      expression: "page.getByRole('button', { name: 'Save' })",
    });
  });

  it('infers roles for common control flags', () => {
    expect(resolvePlaywrightLocator(snapshot({ role: 'switch', innerText: 'On' })).expression)
      .toContain("getByRole('switch'");
    expect(resolvePlaywrightLocator(snapshot({ isLink: true, innerText: 'Docs' })).expression)
      .toContain("getByRole('link'");
    expect(resolvePlaywrightLocator(snapshot({ isTab: true, innerText: 'Tab' })).expression)
      .toContain("getByRole('tab'");
    expect(resolvePlaywrightLocator(snapshot({ isMenuItem: true, innerText: 'Item' })).expression)
      .toContain("getByRole('menuitem'");
    expect(resolvePlaywrightLocator(snapshot({ isOption: true, innerText: 'One' })).expression)
      .toContain("getByRole('option'");
    expect(resolvePlaywrightLocator(snapshot({ isCombobox: true, label: {
      text: null, htmlFor: null, ariaLabel: 'City', ariaLabelledBy: null, placeholder: null,
    } })).expression).toContain("getByRole('combobox'");
    expect(resolvePlaywrightLocator(snapshot({ isCheckbox: true, label: {
      text: 'Agree', htmlFor: null, ariaLabel: null, ariaLabelledBy: null, placeholder: null,
    } })).expression).toContain("getByRole('checkbox'");
    expect(resolvePlaywrightLocator(snapshot({ isRadio: true, label: {
      text: 'A', htmlFor: null, ariaLabel: null, ariaLabelledBy: null, placeholder: null,
    } })).expression).toContain("getByRole('radio'");
    expect(resolvePlaywrightLocator(snapshot({ isInput: true, label: {
      text: null, htmlFor: null, ariaLabel: null, ariaLabelledBy: null, placeholder: 'Name',
    } })).expression).toContain("getByRole('textbox'");
  });

  it('falls back to label, css, then xpath', () => {
    expect(
      resolvePlaywrightLocator(
        snapshot({
          isSelect: true,
          label: {
            text: 'Country',
            htmlFor: null,
            ariaLabel: null,
            ariaLabelledBy: null,
            placeholder: null,
          },
        }),
      ),
    ).toEqual({
      strategy: 'label',
      expression: "page.getByLabel('Country')",
    });

    expect(
      resolvePlaywrightLocator(snapshot({ selector: "#main .row" })),
    ).toEqual({
      strategy: 'css',
      expression: "page.locator('#main .row')",
    });

    expect(resolvePlaywrightLocator(snapshot({ xpath: "//div[@id='x']" }))).toEqual({
      strategy: 'xpath',
      expression: "page.locator('xpath=//div[@id=\\'x\\']')",
    });
  });
});
