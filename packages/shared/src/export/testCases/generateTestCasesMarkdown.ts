import {
  isFlowBranch,
  isFlowSection,
  isFlowStep,
  type FlowOutlineItem,
} from '../../types/events';

export function generateTestCasesMarkdown(
  title: string,
  steps: FlowOutlineItem[],
): string {
  const flowTitle = title.trim() || 'Untitled flow';
  const lines = [
    `# Test cases: ${flowTitle}`,
    '',
    `Generated from Peacock flow documentation.`,
    '',
  ];

  let caseIndex = 0;
  let stepNumber = 0;
  let currentSection: string | null = null;
  const mainPathRows: string[] = [];

  const flushMainPath = () => {
    if (mainPathRows.length === 0) return;
    caseIndex += 1;
    lines.push(`## TC-${String(caseIndex).padStart(3, '0')} — Main path`);
    lines.push('');
    if (currentSection) {
      lines.push(`**Section:** ${currentSection}  `);
    }
    lines.push('**Priority:** High  ');
    lines.push('');
    lines.push('| Step | Action | Expected result |');
    lines.push('| --- | --- | --- |');
    lines.push(...mainPathRows);
    lines.push('');
    mainPathRows.length = 0;
  };

  for (const item of steps) {
    if (isFlowSection(item)) {
      flushMainPath();
      currentSection = item.title.trim() || 'Section';
      continue;
    }

    if (isFlowBranch(item)) {
      flushMainPath();
      for (const path of item.paths) {
        caseIndex += 1;
        const caseId = String(caseIndex).padStart(3, '0');
        lines.push(`## TC-${caseId} — ${item.title.trim() || 'Branch'}: ${path.label.trim() || 'Path'}`);
        lines.push('');
        lines.push('**Priority:** Medium  ');
        lines.push(`**Branch path:** ${path.label.trim() || 'Path'}  `);
        if (path.targetTitle.trim()) {
          lines.push(`**Linked flow:** ${path.targetTitle.trim()}  `);
        }
        lines.push('');
        lines.push('| Step | Action | Expected result |');
        lines.push('| --- | --- | --- |');
        lines.push(
          `| 1 | Select path "${path.label.trim() || 'Path'}" | Linked demo "${path.targetTitle.trim() || path.targetDocumentId}" is available |`,
        );
        lines.push('');
      }
      continue;
    }

    if (!isFlowStep(item)) continue;

    stepNumber += 1;
    const action = item.generatedDescription.trim() || item.generatedTitle.trim() || item.title.trim() || `Step ${stepNumber}`;
    mainPathRows.push(
      `| ${stepNumber} | ${action.replace(/\|/g, '\\|')} | Next step is reachable |`,
    );
  }

  flushMainPath();

  if (caseIndex === 0) {
    lines.push('_No playable steps found in this flow._', '');
  }

  return lines.join('\n');
}
