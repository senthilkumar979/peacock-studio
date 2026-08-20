import { describe, expect, it } from 'vitest';
import { WORKFLOW_ARTIFACT_TYPES } from '@/types/workflowArtifact';
import { getArtifactCopyContent } from './getArtifactCopyContent';

describe('getArtifactCopyContent', () => {
  it('extracts mermaid source for flow map artifacts', () => {
    const content = '# Map\n\n```mermaid\ngraph TD\n  A-->B\n```\n';
    expect(getArtifactCopyContent(WORKFLOW_ARTIFACT_TYPES.flowMap, content)).toBe(
      'graph TD\n  A-->B',
    );
  });

  it('returns raw content for non-flow-map artifacts', () => {
    expect(getArtifactCopyContent(WORKFLOW_ARTIFACT_TYPES.testCases, 'case 1')).toBe('case 1');
    expect(getArtifactCopyContent(WORKFLOW_ARTIFACT_TYPES.playwright, 'test()')).toBe('test()');
  });
});
