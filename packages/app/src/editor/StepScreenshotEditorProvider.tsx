import { createContext, useContext, useState, type ReactNode } from 'react';
import { StepScreenshotEditorOverlay } from './StepScreenshotEditorOverlay';

interface StepScreenshotEditorContextValue {
  openEditor: (stepId: string) => void;
}

const StepScreenshotEditorContext = createContext<StepScreenshotEditorContextValue>({
  openEditor: () => undefined,
});

export function useStepScreenshotEditor(): StepScreenshotEditorContextValue {
  return useContext(StepScreenshotEditorContext);
}

interface StepScreenshotEditorProviderProps {
  children: ReactNode;
}

export const StepScreenshotEditorProvider = ({
  children,
}: StepScreenshotEditorProviderProps) => {
  const [stepId, setStepId] = useState<string | null>(null);

  return (
    <StepScreenshotEditorContext.Provider value={{ openEditor: setStepId }}>
      {children}
      {stepId ? (
        <StepScreenshotEditorOverlay stepId={stepId} onClose={() => setStepId(null)} />
      ) : null}
    </StepScreenshotEditorContext.Provider>
  );
};
