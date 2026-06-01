import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  createId,
  createFlowSection,
  createManualFlowStep,
  getPlayableSteps,
  isFlowSection,
  isFlowStep,
  MANUAL_STEP_PLACEHOLDER_SCREENSHOT,
  type FlowOutlineItem,
  type FlowPayload,
  type FlowStep,
} from '@peacock/shared';
import type { SavedFlowDocument } from '@/types/savedFlow';

interface FlowStore {
  documentId: string | null;
  flow: FlowPayload | null;
  screenshotUrls: Record<string, string>;
  steps: FlowOutlineItem[];
  selectedOutlineId: string | null;
  isLoaded: boolean;

  setFlow: (flow: FlowPayload, screenshotUrls: Record<string, string>) => void;
  setDocumentId: (id: string | null) => void;
  hydrateFromDocument: (doc: SavedFlowDocument) => void;
  resetFlow: () => void;
  selectOutlineItem: (id: string) => void;
  reorderSteps: (from: number, to: number) => void;
  addManualStep: (afterItemId?: string | null) => void;
  addSection: (afterItemId?: string | null) => void;
  deleteOutlineItem: (id: string) => void;
  updateStepTitle: (id: string, title: string) => void;
  updateStepNotes: (id: string, notes: string) => void;
  updateSectionTitle: (id: string, title: string) => void;
  updateSectionDescription: (id: string, description: string) => void;
  setStepCustomScreenshot: (id: string, dataUrl: string) => void;
  resetStepScreenshot: (id: string) => void;
  updateFlowDetails: (title: string, description: string) => void;
}

const initialState = {
  documentId: null,
  flow: null,
  screenshotUrls: {} as Record<string, string>,
  steps: [] as FlowOutlineItem[],
  selectedOutlineId: null as string | null,
  isLoaded: false,
};

function removeCustomScreenshot(
  state: { screenshotUrls: Record<string, string> },
  customId: string
): void {
  delete state.screenshotUrls[customId];
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

export const useFlowStore = create<FlowStore>()(
  immer((set) => ({
    ...initialState,

    setFlow: (flow, screenshotUrls) =>
      set({
        flow,
        screenshotUrls,
        steps: flow.steps,
        selectedOutlineId: pickInitialSelection(flow.steps),
        isLoaded: true,
      }),

    setDocumentId: (id) => set({ documentId: id }),

    hydrateFromDocument: (doc) =>
      set({
        documentId: doc.id,
        flow: doc.flow,
        screenshotUrls: doc.screenshotUrls,
        steps: doc.steps,
        selectedOutlineId: pickInitialSelection(doc.steps),
        isLoaded: true,
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
        const removed = state.steps.find((item) => item.id === id);
        if (removed && isFlowStep(removed) && removed.customScreenshotId) {
          removeCustomScreenshot(state, removed.customScreenshotId);
        }
        state.steps = state.steps.filter((item) => item.id !== id);
        if (state.selectedOutlineId === id) {
          state.selectedOutlineId = pickInitialSelection(state.steps);
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
        if (step && isFlowStep(step)) step.notes = notes;
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
          removeCustomScreenshot(state, step.customScreenshotId);
        }

        const customId = createId();
        state.screenshotUrls[customId] = dataUrl;
        step.customScreenshotId = customId;
      }),

    resetStepScreenshot: (id) =>
      set((state) => {
        const step = state.steps.find((item) => item.id === id);
        if (!step || !isFlowStep(step) || !step.customScreenshotId) return;

        removeCustomScreenshot(state, step.customScreenshotId);
        delete step.customScreenshotId;
      }),

    updateFlowDetails: (title, description) =>
      set((state) => {
        if (!state.flow) return;
        state.flow.flow.title = title;
        state.flow.flow.description = description;
      }),
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
  const steps = useFlowStore((state) => state.steps);
  return getPlayableSteps(steps);
}

export { getStepScreenshotUrl } from '@peacock/shared';
