import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  createFlowBranch,
  createFlowSection,
  createManualFlowStep,
  type FlowBranch,
  type FlowOutlineItem,
  type FlowPayload,
  type FlowSection,
  type FlowStep,
} from '@peacock/shared';
import type { SavedFlowDocument, FlowShareSettings } from '@/types/savedFlow';
import {
  useFlowStore,
  useHasBranches,
  usePlayableSteps,
  useSelectedBranch,
  useSelectedSection,
  useSelectedStep,
  useViewerOutline,
} from './flowStore';

function makeStep(id: string, screenshotId = `${id}-shot`): FlowStep {
  return {
    id,
    title: id,
    notes: '',
    generatedTitle: id,
    generatedDescription: '',
    screenshotId,
    event: {
      id: `${id}-ev`,
      type: 'page-view',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Page',
      viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId,
    },
  };
}

function makeFlow(steps: FlowOutlineItem[]): FlowPayload {
  return {
    flow: {
      title: 'Doc',
      description: 'About',
      version: '1.0.0',
      category: 'general',
      tags: [],
    },
    metadata: {
      createdAt: 1,
      browser: 'test',
      platform: 'test',
      screen: { width: 1, height: 1 },
    },
    steps,
  };
}

function hydrate(doc: Partial<SavedFlowDocument> & Pick<SavedFlowDocument, 'id' | 'flow' | 'steps'>) {
  useFlowStore.getState().hydrateFromDocument({
    savedAt: 1,
    updatedAt: 1,
    status: 'draft',
    screenshotUrls: {},
    stepResources: [],
    ...doc,
  });
}

describe('flowStore resource/description/tags actions', () => {
  beforeEach(() => {
    useFlowStore.getState().resetFlow();
  });

  it('hydrates stepResources and updates flow tags/details', () => {
    const step = makeStep('step-1');
    hydrate({
      id: 'doc-1',
      flow: makeFlow([step]),
      steps: [step],
      stepResources: [
        {
          id: 'r1',
          documentId: 'doc-1',
          stepId: 'step-1',
          url: 'https://example.com/a',
          sortOrder: 0,
          createdAt: 1,
        },
      ],
    });

    const state = useFlowStore.getState();
    expect(state.stepResources).toHaveLength(1);
    expect(state.documentId).toBe('doc-1');

    state.updateFlowTags([' Alpha ', 'alpha', 'Beta']);
    expect(useFlowStore.getState().flow?.flow.tags).toEqual(['alpha', 'beta']);

    state.updateFlowDetails('New', 'Desc', '2.0.0', ['Gamma']);
    expect(useFlowStore.getState().flow?.flow).toMatchObject({
      title: 'New',
      description: 'Desc',
      version: '2.0.0',
      tags: ['gamma'],
    });
  });

  it('adds, updates, and removes step resources', () => {
    const step = makeStep('step-1');
    hydrate({ id: 'doc-1', flow: makeFlow([step]), steps: [step] });

    useFlowStore.getState().addStepResource('step-1', 'https://example.com/one');
    useFlowStore.getState().addStepResource('step-1', 'https://example.com/two');
    let resources = useFlowStore.getState().stepResources;
    expect(resources).toHaveLength(2);
    expect(resources[0]?.sortOrder).toBe(0);
    expect(resources[1]?.sortOrder).toBe(1);

    const id = resources[0]!.id;
    useFlowStore.getState().setStepResourceLabel(id, '  Example One  ');
    expect(useFlowStore.getState().stepResources.find((r) => r.id === id)?.label).toBe('Example One');

    useFlowStore.getState().updateStepResource(id, 'https://example.com/updated');
    expect(useFlowStore.getState().stepResources.find((r) => r.id === id)?.url).toBe(
      'https://example.com/updated',
    );
    expect(useFlowStore.getState().stepResources.find((r) => r.id === id)?.label).toBeUndefined();

    useFlowStore.getState().removeStepResource(id);
    resources = useFlowStore.getState().stepResources;
    expect(resources).toHaveLength(1);
    expect(resources[0]?.url).toBe('https://example.com/two');
  });

  it('ignores resource mutations without documentId and rejects invalid urls', () => {
    const step = makeStep('step-1');
    useFlowStore.getState().setFlow(makeFlow([step]), {});
    expect(useFlowStore.getState().documentId).toBeNull();
    expect(useFlowStore.getState().addStepResource('step-1', 'https://example.com')).toBeUndefined();
    expect(useFlowStore.getState().stepResources).toHaveLength(0);

    hydrate({ id: 'doc-1', flow: makeFlow([step]), steps: [step] });
    expect(() => useFlowStore.getState().addStepResource('step-1', 'ftp://bad')).toThrow(
      /http or https/i,
    );
  });

  it('updates detailed descriptions and enforces plain-text max length', () => {
    const step = makeStep('step-1');
    hydrate({ id: 'doc-1', flow: makeFlow([step]), steps: [step] });

    useFlowStore.getState().updateStepDetailedDescription('step-1', '  <p>Hello</p>  ');
    expect((useFlowStore.getState().steps[0] as FlowStep).detailedDescription).toBe('<p>Hello</p>');

    useFlowStore.getState().updateStepDetailedDescription('step-1', '<p></p>');
    expect((useFlowStore.getState().steps[0] as FlowStep).detailedDescription).toBe('');

    const tooLong = `<p>${'x'.repeat(3001)}</p>`;
    useFlowStore.getState().updateStepDetailedDescription('step-1', '<p>keep</p>');
    useFlowStore.getState().updateStepDetailedDescription('step-1', tooLong);
    expect((useFlowStore.getState().steps[0] as FlowStep).detailedDescription).toBe('<p>keep</p>');
  });

  it('cascades resource delete and prunes screenshots when deleting a step', () => {
    const step = makeStep('step-1', 'shot-1');
    step.customScreenshotId = 'custom-1';
    const other = makeStep('step-2', 'shot-2');

    hydrate({
      id: 'doc-1',
      flow: makeFlow([step, other]),
      steps: [step, other],
      screenshotUrls: {
        'shot-1': 'blob:1',
        'custom-1': 'blob:c',
        'shot-2': 'blob:2',
        orphan: 'blob:x',
      },
      stepResources: [
        {
          id: 'r1',
          documentId: 'doc-1',
          stepId: 'step-1',
          url: 'https://example.com/a',
          sortOrder: 0,
          createdAt: 1,
        },
        {
          id: 'r2',
          documentId: 'doc-1',
          stepId: 'step-2',
          url: 'https://example.com/b',
          sortOrder: 0,
          createdAt: 1,
        },
      ],
    });

    useFlowStore.getState().selectOutlineItem('step-1');
    useFlowStore.getState().deleteOutlineItem('step-1');

    const state = useFlowStore.getState();
    expect(state.steps.map((item) => item.id)).toEqual(['step-2']);
    expect(state.stepResources.map((item) => item.id)).toEqual(['r2']);
    expect(state.screenshotUrls).toEqual({ 'shot-2': 'blob:2' });
    expect(state.selectedOutlineId).toBe('step-2');
  });

  it('clears stepResources when setFlow loads a new capture', () => {
    const step = makeStep('step-1');
    hydrate({
      id: 'doc-1',
      flow: makeFlow([step]),
      steps: [step],
      stepResources: [
        {
          id: 'r1',
          documentId: 'doc-1',
          stepId: 'step-1',
          url: 'https://example.com/a',
          sortOrder: 0,
          createdAt: 1,
        },
      ],
    });

    useFlowStore.getState().setFlow(makeFlow([step]), { 'step-1-shot': 'blob:1' });
    expect(useFlowStore.getState().stepResources).toEqual([]);
    expect(useFlowStore.getState().documentId).toBe('doc-1');
  });
});

describe('flowStore outline and branch actions', () => {
  beforeEach(() => {
    useFlowStore.getState().resetFlow();
  });

  it('setDocumentId, setDocumentStatus, reorderSteps, and share/viewer settings', () => {
    const step = makeStep('step-1');
    const step2 = makeStep('step-2');
    hydrate({ id: 'doc-1', flow: makeFlow([step, step2]), steps: [step, step2] });

    useFlowStore.getState().setDocumentId('doc-2');
    useFlowStore.getState().setDocumentStatus('live');
    expect(useFlowStore.getState().documentId).toBe('doc-2');
    expect(useFlowStore.getState().status).toBe('live');

    useFlowStore.getState().reorderSteps(1, 0);
    expect(useFlowStore.getState().steps.map((item) => item.id)).toEqual(['step-2', 'step-1']);

    const settings: FlowShareSettings = {
      includeMainFlow: false,
      enabledPathIds: ['path-1'],
      enabledBranchIds: ['branch-1'],
    };
    useFlowStore.getState().updateShareSettings(settings);
    expect(useFlowStore.getState().shareSettings).toEqual(settings);

    const filter = {
      includeMainFlow: true,
      enabledPathIds: new Set<string>(),
      enabledBranchIds: new Set<string>(['branch-1']),
    };
    useFlowStore.getState().setViewerFilter(filter);
    expect(useFlowStore.getState().viewerFilter).toEqual(filter);
  });

  it('adds manual steps and sections at end or after a target item', () => {
    const step = makeStep('step-1');
    hydrate({ id: 'doc-1', flow: makeFlow([step]), steps: [step] });

    useFlowStore.getState().addManualStep();
    expect(useFlowStore.getState().steps).toHaveLength(2);
    expect(useFlowStore.getState().selectedOutlineId).toBe(
      useFlowStore.getState().steps[1]?.id,
    );

    useFlowStore.getState().addSection('step-1');
    expect(useFlowStore.getState().steps).toHaveLength(3);
    expect((useFlowStore.getState().steps[1] as FlowSection).title).toBeTruthy();
  });

  it('updates step, section, and branch fields', () => {
    const step = makeStep('step-1');
    const section = createFlowSection('Sec', 'About section');
    const branch = createFlowBranch('Branch', 'Pick one');
    hydrate({
      id: 'doc-1',
      flow: makeFlow([step, section, branch]),
      steps: [step, section, branch],
    });

    useFlowStore.getState().updateStepTitle('step-1', 'Renamed');
    useFlowStore.getState().updateStepNotes('step-1', '  note  ');
    expect((useFlowStore.getState().steps[0] as FlowStep).title).toBe('Renamed');
    expect((useFlowStore.getState().steps[0] as FlowStep).notes).toBe('  note  ');
    expect((useFlowStore.getState().steps[0] as FlowStep).hideDescription).toBe(false);

    useFlowStore.getState().setStepDescriptionHidden('step-1', true);
    expect((useFlowStore.getState().steps[0] as FlowStep).hideDescription).toBe(true);
    expect((useFlowStore.getState().steps[0] as FlowStep).notes).toBe('');

    useFlowStore.getState().updateSectionTitle(section.id, 'New section');
    useFlowStore.getState().updateSectionDescription(section.id, 'Updated');
    expect((useFlowStore.getState().steps[1] as FlowSection).title).toBe('New section');
    expect((useFlowStore.getState().steps[1] as FlowSection).description).toBe('Updated');

    useFlowStore.getState().updateBranchTitle(branch.id, 'New branch');
    useFlowStore.getState().updateBranchDescription(branch.id, 'Branch desc');
    useFlowStore.getState().updateBranchPresentation(branch.id, 'grid');
    expect((useFlowStore.getState().steps[2] as FlowBranch).title).toBe('New branch');
    expect((useFlowStore.getState().steps[2] as FlowBranch).presentation).toBe('grid');
  });

  it('manages custom screenshots and ignores invalid targets', () => {
    const step = makeStep('step-1');
    hydrate({ id: 'doc-1', flow: makeFlow([step]), steps: [step] });

    useFlowStore.getState().setStepCustomScreenshot('step-1', 'data:image/png;base64,abc');
    const customId = (useFlowStore.getState().steps[0] as FlowStep).customScreenshotId;
    expect(customId).toBeTruthy();
    expect(useFlowStore.getState().screenshotUrls[customId!]).toBe('data:image/png;base64,abc');

    useFlowStore.getState().setStepCustomScreenshot('step-1', 'data:image/png;base64,next');
    expect(Object.keys(useFlowStore.getState().screenshotUrls)).toHaveLength(1);

    useFlowStore.getState().resetStepScreenshot('step-1');
    expect((useFlowStore.getState().steps[0] as FlowStep).customScreenshotId).toBeUndefined();

    useFlowStore.getState().updateStepTitle('missing', 'x');
    useFlowStore.getState().resetStepScreenshot('missing');
    useFlowStore.getState().setStepDescriptionHidden('missing', true);
  });

  it('adds branches and paths, then reorders and removes paths', () => {
    const step = makeStep('step-1');
    hydrate({ id: 'doc-1', flow: makeFlow([step]), steps: [step] });

    useFlowStore.getState().addBranch();
    const branchId = useFlowStore.getState().selectedOutlineId!;
    expect(useFlowStore.getState().steps.some((item) => item.id === branchId)).toBe(true);

    useFlowStore.getState().addBranchWithPath(
      {
        label: 'Linked',
        targetDocumentId: 'doc-2',
        targetTitle: 'Other',
        targetDescription: '',
        fromStepId: 'a',
        toStepId: 'b',
      },
      step.id,
    );

    useFlowStore.getState().addPathToBranch(branchId, {
      label: 'Path B',
      targetDocumentId: 'doc-3',
      targetTitle: 'Third',
      targetDescription: '',
      fromStepId: 'x',
      toStepId: 'y',
      order: 5,
    });

    const branch = useFlowStore.getState().steps.find((item) => item.id === branchId) as FlowBranch;
    const pathId = branch.paths[0]!.id;
    useFlowStore.getState().updatePathLabel(branchId, pathId, 'Renamed path');
    const updatedBranch = useFlowStore.getState().steps.find((item) => item.id === branchId) as FlowBranch;
    expect(updatedBranch.paths[0]?.label).toBe('Renamed path');

    useFlowStore.getState().reorderBranchPaths(branchId, 0, 1);
    useFlowStore.getState().removePathFromBranch(branchId, pathId);
    const afterRemove = useFlowStore.getState().steps.find((item) => item.id === branchId) as FlowBranch;
    expect(afterRemove.paths.find((path) => path.id === pathId)).toBeUndefined();

    useFlowStore.getState().addPathToBranch('missing', {
      label: 'Nope',
      targetDocumentId: 'd',
      targetTitle: 'T',
      targetDescription: '',
      fromStepId: 'a',
      toStepId: 'b',
    });
    useFlowStore.getState().reorderBranchPaths('missing', 0, 1);
  });

  it('deletes sections/branches without screenshot cleanup', () => {
    const section = createFlowSection();
    const branch = createFlowBranch();
    hydrate({
      id: 'doc-1',
      flow: makeFlow([section, branch]),
      steps: [section, branch],
    });
    useFlowStore.getState().selectOutlineItem(section.id);
    useFlowStore.getState().deleteOutlineItem(section.id);
    expect(useFlowStore.getState().steps).toHaveLength(1);
    useFlowStore.getState().deleteOutlineItem(branch.id);
    expect(useFlowStore.getState().steps).toHaveLength(0);
    expect(useFlowStore.getState().selectedOutlineId).toBeNull();
  });

  it('hydrates shareSettings fallback and resetFlow clears state', () => {
    const step = makeStep('step-1');
    hydrate({
      id: 'doc-1',
      flow: makeFlow([step]),
      steps: [step],
      shareSettings: {
        includeMainFlow: true,
        enabledPathIds: ['path-a'],
        enabledBranchIds: ['branch-a'],
      },
    });
    expect(useFlowStore.getState().shareSettings?.enabledBranchIds).toEqual(['branch-a']);

    useFlowStore.getState().resetFlow();
    expect(useFlowStore.getState().flow).toBeNull();
    expect(useFlowStore.getState().isLoaded).toBe(false);
  });

  it('setFlow normalizes version and picks initial selection', () => {
    const manual = createManualFlowStep();
    useFlowStore.getState().setFlow(
      {
        flow: {
          title: 'Cap',
          description: '',
          version: '',
          category: 'general',
          tags: [],
        },
        metadata: {
          createdAt: 1,
          browser: 'test',
          platform: 'test',
          screen: { width: 1, height: 1 },
        },
        steps: [manual],
      },
      {},
    );
    expect(useFlowStore.getState().flow?.flow.version).toBeTruthy();
    expect(useFlowStore.getState().selectedOutlineId).toBe(manual.id);
  });
});

describe('flowStore selector hooks', () => {
  beforeEach(() => {
    useFlowStore.getState().resetFlow();
  });

  it('useSelectedStep, useSelectedSection, and useSelectedBranch', () => {
    const step = makeStep('step-1');
    const section = createFlowSection();
    const branch = createFlowBranch();
    hydrate({
      id: 'doc-1',
      flow: makeFlow([step, section, branch]),
      steps: [step, section, branch],
    });

    useFlowStore.getState().selectOutlineItem('step-1');
    expect(renderHook(() => useSelectedStep()).result.current?.id).toBe('step-1');
    expect(renderHook(() => useSelectedSection()).result.current).toBeNull();
    expect(renderHook(() => useSelectedBranch()).result.current).toBeNull();

    useFlowStore.getState().selectOutlineItem(section.id);
    expect(renderHook(() => useSelectedStep()).result.current).toBeNull();
    expect(renderHook(() => useSelectedSection()).result.current?.id).toBe(section.id);

    useFlowStore.getState().selectOutlineItem(branch.id);
    expect(renderHook(() => useSelectedBranch()).result.current?.id).toBe(branch.id);
  });

  it('usePlayableSteps, useViewerOutline, and useHasBranches', () => {
    const step = makeStep('step-1');
    const branch = createFlowBranch();
    hydrate({ id: 'doc-1', flow: makeFlow([step, branch]), steps: [step, branch] });

    expect(renderHook(() => useHasBranches()).result.current).toBe(true);
    expect(renderHook(() => usePlayableSteps()).result.current).toHaveLength(1);

    useFlowStore.getState().setViewerFilter({
      includeMainFlow: true,
      enabledPathIds: new Set<string>(),
      enabledBranchIds: new Set<string>(),
    });
    const { result } = renderHook(() => useViewerOutline());
    expect(result.current.map((item) => item.id)).toEqual(['step-1']);
  });
});
