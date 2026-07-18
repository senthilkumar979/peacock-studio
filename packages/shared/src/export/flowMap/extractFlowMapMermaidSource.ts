export function extractFlowMapMermaidSource(content: string): string {
  const match = content.match(/```mermaid\n([\s\S]*?)```/);
  return match?.[1]?.trim() ?? content.trim();
}
