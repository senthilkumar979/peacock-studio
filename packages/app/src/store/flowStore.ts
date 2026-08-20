import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  createId,
  createFlowBranch,
  createFlowSection,
  createManualFlowStep,
  getPlayableSteps,
  isFlowBranch,
  isFlowSection,
  isFlowStep,
  MANUAL_STEP_PLACEHOLDER_SCREENSHOT,
  normalizeFlowTags,
  normalizeStepResource,
  pruneScreenshotUrls,
  sortBranchPaths,
  type FlowBranch,
  type FlowBranchPresentation,
  type FlowOutlineItem,
  type FlowPayload,
  type FlowStep,
  type LinkedPeacockPath,
  type StepResource,
} from '@peacock/shared';
import type { FlowDocumentStatus, FlowShareSettings, SavedFlowDocument } from '@/types/savedFlow';
import { normalizeFlowStatus, normalizeFlowVersion } from '@/utils/flowDocumentMeta';
import { normalizeRichText, STEP_DETAILED_DESCRIPTION_MAX_CHARS, richTextPlainLength } from '@/utils/richText';
import {
  buildDefaultShareSettings,
  filterOutlineForViewer,
  type FlowViewerFilter,
} from '@/utils/flowShareSettings';

interface FlowStore {
  documentId: string | null;
  flow: FlowPayload | null;
  screenshotUrls: Record<string, string>;
  steps: FlowOutlineItem[];
  selectedOutlineId: string | null;
  isLoaded: boolean;
  status: FlowDocumentStatus;
  shareSettings: FlowShareSettings | null;
  viewerFilter: FlowViewerFilter | null;
  stepResources: StepResource[];

  setFlow: (flow: FlowPayload, screenshotUrls: Record<string, string>) => void;
  setDocumentId: (id: string | null) => void;
  setDocumentStatus: (status: FlowDocumentStatus) => void;
  hydrateFromDocument: (doc: SavedFlowDocument) => void;
  resetFlow: () => void;
  selectOutlineItem: (id: string) => void;
  reorderSteps: (from: number, to: number) => void;
  addManualStep: (afterItemId?: string | null) => void;
  addSection: (afterItemId?: string | null) => void;
  deleteOutlineItem: (id: string) => void;
  updateStepTitle: (id: string, title: string) => void;
  updateStepNotes: (id: string, notes: string) => void;
  setStepDescriptionHidden: (id: string, hidden: boolean) => void;
  updateSectionTitle: (id: string, title: string) => void;
  updateSectionDescription: (id: string, description: string) => void;
  setStepCustomScreenshot: (id: string, dataUrl: string) => void;
  resetStepScreenshot: (id: string) => void;
  updateFlowDetails: (title: string, description: string, version: string, tags?: string[]) => void;
  updateFlowTags: (tags: string[]) => void;
  addStepResource: (stepId: string, url: string) => string | undefined;
  updateStepResource: (resourceId: string, url: string) => void;
  setStepResourceLabel: (resourceId: string, label: string) => void;
  removeStepResource: (resourceId: string) => void;
  updateStepDetailedDescription: (stepId: string, html: string) => void;
  addBranch: (afterItemId?: string | null) => void;
  addBranchWithPath: (
    path: Omit<LinkedPeacockPath, 'id' | 'order'>,
    afterItemId?: string | null,
  ) => void;
  addPathToBranch: (
    branchId: string,
    path: Omit<LinkedPeacockPath, 'id' | 'order'> & { order?: number },
  ) => void;
  updateBranchTitle: (id: string, title: string) => void;
  updateBranchDescription: (id: string, description: string) => void;
  updateBranchPresentation: (id: string, presentation: FlowBranchPresentation) => void;
  updatePathLabel: (branchId: string, pathId: string, label: string) => void;
  removePathFromBranch: (branchId: string, pathId: string) => void;
  reorderBranchPaths: (branchId: string, from: number, to: number) => void;
  updateShareSettings: (settings: FlowShareSettings) => void;
  setViewerFilter: (filter: FlowViewerFilter | null) => void;
}

const initialState = {
  documentId: null,
  flow: null,
  screenshotUrls: {} as Record<string, string>,
  steps: [] as FlowOutlineItem[],
  selectedOutlineId: null as string | null,
  isLoaded: false,
  status: 'draft' as FlowDocumentStatus,
  shareSettings: null as FlowShareSettings | null,
  viewerFilter: null as FlowViewerFilter | null,
  stepResources: [] as StepResource[],
};

function removeStepScreenshots(
  state: { screenshotUrls: Record<string, string> },
  step: FlowStep,
): void {
  if (step.customScreenshotId) {
    delete state.screenshotUrls[step.customScreenshotId];
  }
  if (step.screenshotId) {
    delete state.screenshotUrls[step.screenshotId];
  }
}

function pruneStoreScreenshots(state: {
  screenshotUrls: Record<string, string>;
  steps: FlowOutlineItem[];
}): void {
  state.screenshotUrls = pruneScreenshotUrls(state.screenshotUrls, state.steps);
}

function syncFlowSteps(state: { flow: FlowPayload | null; steps: FlowOutlineItem[] }): void {
  if (state.flow) state.flow.steps = state.steps;
}

function resolveInsertIndex(items: FlowOutlineItem[], afterItemId?: string | null): number {
  if (!afterItemId) return items.length;
  const index = items.findIndex((item) => item.id === afterItemId);
  return index >= 0 ? index + 1 : items.length;
}

function pickInitialSelection(items: FlowOutlineItem[]): string | null {
  return getPlayableSteps(items)[0]?.id ?? items[0]?.id ?? null;
}

function pickSelectionAfterDelete(items: FlowOutlineItem[], deletedIndex: number): string | null {
  if (items.length === 0) return null;
  const nextIndex = deletedIndex > 0 ? deletedIndex - 1 : 0;
  return items[nextIndex]?.id ?? items[items.length - 1]?.id ?? null;
}

export const useFlowStore = create<FlowStore>()(
  immer((set, get) => ({
    ...initialState,

    setFlow: (flow, screenshotUrls) =>
      set({
        flow: {
          ...flow,
          flow: {
            ...flow.flow,
            version: normalizeFlowVersion(flow.flow.version),
          },
        },
        screenshotUrls,
        steps: flow.steps,
        selectedOutlineId: pickInitialSelection(flow.steps),
        isLoaded: true,
        status: 'draft',
        shareSettings: buildDefaultShareSettings(flow.steps),
        viewerFilter: null,
        stepResources: [],
      }),

    setDocumentId: (id) => set({ documentId: id }),

    setDocumentStatus: (status) => set({ status }),

    hydrateFromDocument: (doc) =>
      set({
        documentId: doc.id,
        flow: {
          ...doc.flow,
          flow: {
            ...doc.flow.flow,
            version: normalizeFlowVersion(doc.flow.flow.version),
            tags: normalizeFlowTags(doc.flow.flow.tags ?? []),
          },
        },
        screenshotUrls: doc.screenshotUrls,
        steps: doc.steps,
        selectedOutlineId: pickInitialSelection(doc.steps),
        isLoaded: true,
        status: normalizeFlowStatus(doc.status, 'live'),
        shareSettings: doc.shareSettings ?? buildDefaultShareSettings(doc.steps),
        viewerFilter: null,
        stepResources: doc.stepResources ?? [],
      }),

    resetFlow: () => set({ ...initialState }),

    selectOutlineItem: (id) => set({ selectedOutlineId: id }),

    reorderSteps: (from, to) =>
      set((state) => {
        const [item] = state.steps.splice(from, 1);
        if (item) state.steps.splice(to, 0, item);
        syncFlowSteps(state);
      }),

    addManualStep: (afterItemId) =>
      set((state) => {
        const step = createManualFlowStep();
        state.screenshotUrls[step.screenshotId] = MANUAL_STEP_PLACEHOLDER_SCREENSHOT;
        const index = resolveInsertIndex(state.steps, afterItemId ?? state.selectedOutlineId);
        state.steps.splice(index, 0, step);
        state.selectedOutlineId = step.id;
        syncFlowSteps(state);
      }),

    addSection: (afterItemId) =>
      set((state) => {
        const section = createFlowSection();
        const index = resolveInsertIndex(state.steps, afterItemId ?? state.selectedOutlineId);
        state.steps.splice(index, 0, section);
        state.selectedOutlineId = section.id;
        syncFlowSteps(state);
      }),

    deleteOutlineItem: (id) =>
      set((state) => {
        const deletedIndex = state.steps.findIndex((item) => item.id === id);
        const removed = state.steps.find((item) => item.id === id);
        if (removed && isFlowStep(removed)) {
          removeStepScreenshots(state, removed);
        }
        state.stepResources = state.stepResources.filter(
          (resource) => resource.stepId !== id,
        );
        state.steps = state.steps.filter((item) => item.id !== id);
        pruneStoreScreenshots(state);
        if (state.selectedOutlineId === id) {
          state.selectedOutlineId = pickSelectionAfterDelete(state.steps, deletedIndex);
        }
        syncFlowSteps(state);
      }),

    updateStepTitle: (id, title) =>
      set((state) => {
        const step = state.steps.find((item) => item.id === id);
        if (step && isFlowStep(step)) step.title = title;
      }),

    updateStepNotes: (id, notes) =>
      set((state) => {
        const step = state.steps.find((item) => item.id === id);
        if (step && isFlowStep(step)) {
          step.notes = notes;
          if (notes.trim()) step.hideDescription = false;
        }
      }),

    setStepDescriptionHidden: (id, hidden) =>
      set((state) => {
        const step = state.steps.find((item) => item.id === id);
        if (!step || !isFlowStep(step)) return;
        step.hideDescription = hidden;
        if (hidden) step.notes = '';
      }),

    updateSectionTitle: (id, title) =>
      set((state) => {
        const section = state.steps.find((item) => item.id === id);
        if (section && isFlowSection(section)) section.title = title;
      }),

    updateSectionDescription: (id, description) =>
      set((state) => {
        const section = state.steps.find((item) => item.id === id);
        if (section && isFlowSection(section)) section.description = description;
      }),

    setStepCustomScreenshot: (id, dataUrl) =>
      set((state) => {
        const step = state.steps.find((item) => item.id === id);
        if (!step || !isFlowStep(step)) return;

        if (step.customScreenshotId) {
          delete state.screenshotUrls[step.customScreenshotId];
        }

        const customId = createId();
        state.screenshotUrls[customId] = dataUrl;
        step.customScreenshotId = customId;
      }),

    resetStepScreenshot: (id) =>
      set((state) => {
        const step = state.steps.find((item) => item.id === id);
        if (!step || !isFlowStep(step) || !step.customScreenshotId) return;

        delete state.screenshotUrls[step.customScreenshotId];
        delete step.customScreenshotId;
      }),

    updateFlowDetails: (title, description, version, tags) =>
      set((state) => {
        if (!state.flow) return;
        state.flow.flow.title = title;
        state.flow.flow.description = description;
        state.flow.flow.version = normalizeFlowVersion(version);
        if (tags !== undefined) {
          state.flow.flow.tags = normalizeFlowTags(tags);
        }
      }),

    updateFlowTags: (tags) =>
      set((state) => {
        if (!state.flow) return;
        state.flow.flow.tags = normalizeFlowTags(tags);
      }),

    addStepResource: (stepId, url) => {
      const documentId = get().documentId;
      if (!documentId) return undefined;
      const sortOrder = get().stepResources.filter((resource) => resource.stepId === stepId).length;
      const resource = normalizeStepResource({
        documentId,
        stepId,
        url,
        sortOrder,
      });
      set((state) => {
        state.stepResources.push(resource);
      });
      return resource.id;
    },

    updateStepResource: (resourceId, url) =>
      set((state) => {
        const resource = state.stepResources.find((item) => item.id === resourceId);
        if (!resource) return;
        const normalized = normalizeStepResource({
          ...resource,
          url,
          label: undefined,
        });
        resource.url = normalized.url;
        delete resource.label;
      }),

    setStepResourceLabel: (resourceId, label) =>
      set((state) => {
        const resource = state.stepResources.find((item) => item.id === resourceId);
        if (!resource) return;
        const normalized = normalizeStepResource({
          ...resource,
          label,
        });
        if (normalized.label) resource.label = normalized.label;
        else delete resource.label;
      }),

    removeStepResource: (resourceId) =>
      set((state) => {
        state.stepResources = state.stepResources.filter((item) => item.id !== resourceId);
      }),

    updateStepDetailedDescription: (stepId, html) =>
      set((state) => {
        const step = state.steps.find((item) => item.id === stepId);
        if (!step || !isFlowStep(step)) return;
        const normalized = normalizeRichText(html);
        if (richTextPlainLength(normalized) > STEP_DETAILED_DESCRIPTION_MAX_CHARS) return;
        step.detailedDescription = normalized;
      }),

    addBranch: (afterItemId) =>
      set((state) => {
        const branch = createFlowBranch();
        const index = resolveInsertIndex(state.steps, afterItemId ?? state.selectedOutlineId);
        state.steps.splice(index, 0, branch);
        state.selectedOutlineId = branch.id;
        syncFlowSteps(state);
      }),

    addBranchWithPath: (pathInput, afterItemId) =>
      set((state) => {
        const branch = createFlowBranch(pathInput.label, '');
        const path: LinkedPeacockPath = {
          id: createId(),
          order: 0,
          label: pathInput.label,
          targetDocumentId: pathInput.targetDocumentId,
          targetTitle: pathInput.targetTitle,
          targetDescription: pathInput.targetDescription,
          fromStepId: pathInput.fromStepId,
          toStepId: pathInput.toStepId,
        };
        branch.paths = [path];
        const index = resolveInsertIndex(state.steps, afterItemId ?? state.selectedOutlineId);
        state.steps.splice(index, 0, branch);
        state.selectedOutlineId = branch.id;
        syncFlowSteps(state);
      }),

    addPathToBranch: (branchId, pathInput) =>
      set((state) => {
        const branch = state.steps.find((item) => item.id === branchId);
        if (!branch || !isFlowBranch(branch)) return;

        const order =
          pathInput.order ?? branch.paths.reduce((max, path) => Math.max(max, path.order), -1) + 1;
        const path: LinkedPeacockPath = {
          id: createId(),
          label: pathInput.label,
          targetDocumentId: pathInput.targetDocumentId,
          targetTitle: pathInput.targetTitle,
          targetDescription: pathInput.targetDescription,
          fromStepId: pathInput.fromStepId,
          toStepId: pathInput.toStepId,
          order,
        };
        branch.paths.push(path);
        syncFlowSteps(state);
      }),

    updateBranchTitle: (id, title) =>
      set((state) => {
        const branch = state.steps.find((item) => item.id === id);
        if (branch && isFlowBranch(branch)) branch.title = title;
      }),

    updateBranchDescription: (id, description) =>
      set((state) => {
        const branch = state.steps.find((item) => item.id === id);
        if (branch && isFlowBranch(branch)) branch.description = description;
      }),

    updateBranchPresentation: (id, presentation) =>
      set((state) => {
        const branch = state.steps.find((item) => item.id === id);
        if (branch && isFlowBranch(branch)) branch.presentation = presentation;
      }),

    updatePathLabel: (branchId, pathId, label) =>
      set((state) => {
        const branch = state.steps.find((item) => item.id === branchId);
        if (!branch || !isFlowBranch(branch)) return;
        const path = branch.paths.find((item) => item.id === pathId);
        if (path) path.label = label;
      }),

    removePathFromBranch: (branchId, pathId) =>
      set((state) => {
        const branch = state.steps.find((item) => item.id === branchId);
        if (!branch || !isFlowBranch(branch)) return;
        branch.paths = branch.paths.filter((path) => path.id !== pathId);
        syncFlowSteps(state);
      }),

    reorderBranchPaths: (branchId, from, to) =>
      set((state) => {
        const branch = state.steps.find((item) => item.id === branchId);
        if (!branch || !isFlowBranch(branch)) return;
        const sorted = sortBranchPaths(branch.paths);
        const [item] = sorted.splice(from, 1);
        if (!item) return;
        sorted.splice(to, 0, item);
        branch.paths = sorted.map((path, index) => ({ ...path, order: index }));
        syncFlowSteps(state);
      }),

    updateShareSettings: (settings) => set({ shareSettings: settings }),

    setViewerFilter: (filter) => set({ viewerFilter: filter }),
  }))
);

export function useSelectedStep(): FlowStep | null {
  const steps = useFlowStore((state) => state.steps);
  const selectedOutlineId = useFlowStore((state) => state.selectedOutlineId);
  const item = steps.find((step) => step.id === selectedOutlineId);
  return item && isFlowStep(item) ? item : null;
}

export function useSelectedSection() {
  const steps = useFlowStore((state) => state.steps);
  const selectedOutlineId = useFlowStore((state) => state.selectedOutlineId);
  const item = steps.find((step) => step.id === selectedOutlineId);
  return item && isFlowSection(item) ? item : null;
}

export function usePlayableSteps(): FlowStep[] {
  const steps = useViewerOutline();
  return getPlayableSteps(steps);
}

export function useSelectedBranch(): FlowBranch | null {
  const steps = useFlowStore((state) => state.steps);
  const selectedOutlineId = useFlowStore((state) => state.selectedOutlineId);
  const item = steps.find((step) => step.id === selectedOutlineId);
  return item && isFlowBranch(item) ? item : null;
}

export function useViewerOutline(): FlowOutlineItem[] {
  const steps = useFlowStore((state) => state.steps);
  const viewerFilter = useFlowStore((state) => state.viewerFilter);
  return filterOutlineForViewer(steps, viewerFilter);
}

export function useHasBranches(): boolean {
  const steps = useFlowStore((state) => state.steps);
  return steps.some(isFlowBranch);
}

export { getStepScreenshotUrl } from '@peacock/shared';
