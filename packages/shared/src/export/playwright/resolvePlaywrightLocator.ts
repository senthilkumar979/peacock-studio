import type { ElementSnapshot } from '../../types/events';

export interface PlaywrightLocator {
  expression: string;
  strategy: 'role' | 'testId' | 'label' | 'css' | 'xpath';
}

function escapeString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function pickRoleName(snapshot: ElementSnapshot): string | null {
  const candidates = [
    snapshot.label.ariaLabel,
    snapshot.label.text,
    snapshot.innerText,
    snapshot.label.placeholder,
  ];
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed.slice(0, 80);
  }
  return null;
}

export function resolvePlaywrightLocator(snapshot: ElementSnapshot): PlaywrightLocator {
  const testId = snapshot.dataAttributes.testid ?? snapshot.dataAttributes['test-id'];
  if (testId) {
    return {
      strategy: 'testId',
      expression: `page.getByTestId('${escapeString(testId)}')`,
    };
  }

  const role = snapshot.role ?? (snapshot.isButton ? 'button' : snapshot.isLink ? 'link' : null);
  const name = pickRoleName(snapshot);
  if (role && name) {
    return {
      strategy: 'role',
      expression: `page.getByRole('${escapeString(role)}', { name: '${escapeString(name)}' })`,
    };
  }

  if (snapshot.isInput || snapshot.isSelect || snapshot.isCheckbox || snapshot.isRadio) {
    const label = snapshot.label.text?.trim() || snapshot.label.ariaLabel?.trim();
    if (label) {
      return {
        strategy: 'label',
        expression: `page.getByLabel('${escapeString(label.slice(0, 80))}')`,
      };
    }
  }

  if (snapshot.selector) {
    return {
      strategy: 'css',
      expression: `page.locator('${escapeString(snapshot.selector)}')`,
    };
  }

  return {
    strategy: 'xpath',
    expression: `page.locator('xpath=${escapeString(snapshot.xpath)}')`,
  };
}
