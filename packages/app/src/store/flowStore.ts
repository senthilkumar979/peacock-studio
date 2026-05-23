import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createId, type FlowPayload, type FlowStep } from '@peacock/shared';
import type { SavedFlowDocument } from '@/types/savedFlow';

interface FlowStore {
  documentId: string | null;
  flow: FlowPayload | null;
  screenshotUrls: Record<string, string>;
  steps: FlowStep[];
  selectedStepId: string | null;
  isLoaded: boolean;

  setFlow: (flow: FlowPayload, screenshotUrls: Record<string, string>) => void;
  setDocumentId: (id: string | null) => void;
  hydrateFromDocument: (doc: SavedFlowDocument) => void;
  resetFlow: () => void;
  selectStep: (id: string) => void;
  reorderSteps: (from: number, to: number) => void;
  deleteStep: (id: string) => void;
  updateStepTitle: (id: string, title: string) => void;
  updateStepNotes: (id: string, notes: string) => void;
  setStepCustomScreenshot: (id: string, dataUrl: string) => void;
  resetStepScreenshot: (id: string) => void;
  updateFlowDetails: (title: string, description: string) => void;
}

const initialState = {
  documentId: null,
  flow: null,
  screenshotUrls: {} as Record<string, string>,
  steps: [] as FlowStep[],
  selectedStepId: null as string | null,
  isLoaded: false,
};

function removeCustomScreenshot(state: { screenshotUrls: Record<string, string> }, customId: string): void {
  delete state.screenshotUrls[customId];
}

export const useFlowStore = create<FlowStore>()(
  immer((set) => ({
    ...initialState,

    setFlow: (flow, screenshotUrls) =>
      set({
        flow,
        screenshotUrls,
        steps: flow.steps,
        selectedStepId: flow.steps[0]?.id ?? null,
        isLoaded: true,
      }),

    setDocumentId: (id) => set({ documentId: id }),

    hydrateFromDocument: (doc) =>
      set({
        documentId: doc.id,
        flow: doc.flow,
        screenshotUrls: doc.screenshotUrls,
        steps: doc.steps,
        selectedStepId: doc.steps[0]?.id ?? null,
        isLoaded: true,
      }),

    resetFlow: () => set({ ...initialState }),

    selectStep: (id) => set({ selectedStepId: id }),

    reorderSteps: (from, to) =>
      set((state) => {
        const [step] = state.steps.splice(from, 1);
        if (step) state.steps.splice(to, 0, step);
      }),

    deleteStep: (id) =>
      set((state) => {
        const removed = state.steps.find((step) => step.id === id);
        if (removed?.customScreenshotId) {
          removeCustomScreenshot(state, removed.customScreenshotId);
        }
        state.steps = state.steps.filter((step) => step.id !== id);
        if (state.selectedStepId === id) {
          state.selectedStepId = state.steps[0]?.id ?? null;
        }
      }),

    updateStepTitle: (id, title) =>
      set((state) => {
        const step = state.steps.find((item) => item.id === id);
        if (step) step.title = title;
      }),

    updateStepNotes: (id, notes) =>
      set((state) => {
        const step = state.steps.find((item) => item.id === id);
        if (step) step.notes = notes;
      }),

    setStepCustomScreenshot: (id, dataUrl) =>
      set((state) => {
        const step = state.steps.find((item) => item.id === id);
        if (!step) return;

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
        if (!step?.customScreenshotId) return;

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
  const selectedStepId = useFlowStore((state) => state.selectedStepId);
  return steps.find((step) => step.id === selectedStepId) ?? null;
}

export { getStepScreenshotUrl } from '@peacock/shared';
