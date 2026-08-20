import { describe, expect, it } from 'vitest';
import * as shared from './index';

describe('package barrel exports', () => {
  it('re-exports key runtime helpers and constants', () => {
    expect(typeof shared.createFlowStep).toBe('function');
    expect(typeof shared.getXPath).toBe('function');
    expect(typeof shared.getUniqueSelector).toBe('function');
    expect(typeof shared.humanizeIdentifier).toBe('function');
    expect(typeof shared.generatePlaywrightSpec).toBe('function');
    expect(typeof shared.generateTestCasesMarkdown).toBe('function');
    expect(typeof shared.buildWorkflowGraph).toBe('function');
    expect(shared.HANDOFF_REQUEST).toBe('PEACOCK_REQUEST_HANDOFF');
    expect(shared.MAX_IMAGE_BYTES).toBeGreaterThan(0);
    expect(shared.DATA_CLASSIFICATIONS).toContain('public');
    expect(shared.SECRET_PLACEHOLDER).toBeTruthy();
    expect(shared.DEFAULT_CAPTURE_EDITOR_SETTINGS.padding).toBe(60);
  });
});
