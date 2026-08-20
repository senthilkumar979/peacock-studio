import { describe, expect, it } from 'vitest';
import { extractFlowMapMermaidSource } from './extractFlowMapMermaidSource';

describe('extractFlowMapMermaidSource', () => {
  it('extracts mermaid fence contents', () => {
    const content = '# Title\n\n```mermaid\nflowchart TD\n  A --> B\n```\n';
    expect(extractFlowMapMermaidSource(content)).toBe('flowchart TD\n  A --> B');
  });

  it('returns trimmed content when no fence exists', () => {
    expect(extractFlowMapMermaidSource('  flowchart TD  ')).toBe('flowchart TD');
  });
});
