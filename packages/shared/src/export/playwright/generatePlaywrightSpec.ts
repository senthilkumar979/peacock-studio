import {
  getPlayableSteps,
  isFlowSection,
  type FlowOutlineItem,
  type FlowStep,
} from '../../types/events';
import { resolvePlaywrightLocator } from './resolvePlaywrightLocator';

function escapeString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function getEventUrl(event: FlowStep['event']): string | null {
  if (event.type === 'navigation') return event.toUrl.trim() || null;
  if ('url' in event) return event.url.trim() || null;
  return null;
}

function getBaseUrl(steps: FlowStep[]): string {
  for (const step of steps) {
    const url = getEventUrl(step.event);
    if (url) {
      try {
        return new URL(url).origin;
      } catch {
        continue;
      }
    }
  }
  return 'https://example.com';
}

function statementForStep(step: FlowStep): string[] {
  const event = step.event;

  if (event.type === 'navigation' || event.type === 'page-view') {
    const url = getEventUrl(event);
    if (url?.trim()) {
      return [`await page.goto('${escapeString(url.trim())}');`];
    }
    return [`await page.waitForLoadState('networkidle');`];
  }

  const locator = resolvePlaywrightLocator(event.element);
  const lines: string[] = [];

  if (event.type === 'input') {
    const value = event.valuePreview?.trim();
    if (event.element.isCheckbox || event.element.isRadio) {
      if (value) {
        lines.push(`await ${locator.expression}.check();`);
      } else {
        lines.push(`await ${locator.expression}.uncheck();`);
      }
      return lines;
    }
    if (value && value !== '••••') {
      lines.push(`await ${locator.expression}.fill('${escapeString(value)}');`);
    } else {
      lines.push(`await ${locator.expression}.fill(process.env.PEACOCK_INPUT ?? '');`);
    }
    return lines;
  }

  if (event.type === 'submit') {
    lines.push(`await ${locator.expression}.press('Enter');`);
    return lines;
  }

  lines.push(`await ${locator.expression}.click();`);
  return lines;
}

export function generatePlaywrightSpec(
  title: string,
  steps: FlowOutlineItem[],
): string {
  const playableSteps = getPlayableSteps(steps);
  const flowTitle = title.trim() || 'Untitled flow';
  const safeName = flowTitle.replace(/'/g, "\\'");
  const baseUrl = getBaseUrl(playableSteps);

  const lines = [
    "import { test, expect } from '@playwright/test';",
    '',
    `test.describe('${safeName}', () => {`,
    `  test('main path', async ({ page }) => {`,
  ];

  if (playableSteps.length === 0) {
    lines.push(`    test.skip(true, 'No playable steps in this flow.');`);
  } else {
    const firstUrl = playableSteps[0] ? getEventUrl(playableSteps[0].event) : null;
    if (firstUrl) {
      lines.push(`    await page.goto('${escapeString(firstUrl)}');`);
    } else {
      lines.push(`    await page.goto('${escapeString(baseUrl)}');`);
    }

    let currentSection: string | null = null;
    for (const item of steps) {
      if (isFlowSection(item)) {
        currentSection = item.title.trim() || 'Section';
        lines.push('');
        lines.push(`    // Section: ${currentSection}`);
        continue;
      }
      if (!('event' in item)) continue;
      const step = item as FlowStep;
      if (!playableSteps.some((candidate) => candidate.id === step.id)) continue;

      lines.push('');
      lines.push(`    // ${step.generatedTitle.trim() || step.title.trim() || 'Step'}`);
      lines.push(...statementForStep(step).map((line) => `    ${line}`));
    }

    lines.push('');
    lines.push(`    await expect(page).toHaveURL(/.*/);`);
  }

  lines.push('  });', '});', '');
  return lines.join('\n');
}
