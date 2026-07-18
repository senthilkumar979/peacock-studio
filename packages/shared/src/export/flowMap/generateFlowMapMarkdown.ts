import type { FlowOutlineItem } from '../../types/events';
import { buildWorkflowGraph } from '../workflowGraph/buildWorkflowGraph';

function nodeShape(kind: string, id: string, label: string): string {
  const safeLabel = label.replace(/"/g, "'");
  if (kind === 'branch') return `${id}{{"${safeLabel}"}}`;
  if (kind === 'section') return `${id}[/"${safeLabel}"/]`;
  if (kind === 'path') return `${id}(["${safeLabel}"])`;
  if (kind === 'root') return `${id}(["${safeLabel}"])`;
  return `${id}["${safeLabel}"]`;
}

export function generateFlowMapMarkdown(
  title: string,
  steps: FlowOutlineItem[],
): string {
  const graph = buildWorkflowGraph(title, steps);
  const lines = ['# Flow map', '', `\`${graph.title}\` visualized as a flowchart.`, '', '```mermaid', 'flowchart TD'];

  for (const node of graph.nodes) {
    lines.push(`  ${nodeShape(node.kind, node.id, node.label)}`);
  }

  for (const edge of graph.edges) {
    if (edge.label) {
      lines.push(`  ${edge.from} -->|${edge.label.replace(/"/g, "'")}| ${edge.to}`);
    } else {
      lines.push(`  ${edge.from} --> ${edge.to}`);
    }
  }

  lines.push('```', '');
  return lines.join('\n');
}
