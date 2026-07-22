import { useState } from 'react';
import { ShareDocumentModal } from '@/components/share/ShareDocumentModal';
import { persistCurrentFlow } from '@/services/flowLibraryService';
import { useFlowStore } from '@/store/flowStore';

export function useDocumentShareModal(documentId: string) {
  const flow = useFlowStore((state) => state.flow);
  const outline = useFlowStore((state) => state.steps);
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls);
  const shareSettings = useFlowStore((state) => state.shareSettings);
  const updateShareSettings = useFlowStore((state) => state.updateShareSettings);
  const [isOpen, setIsOpen] = useState(false);

  const shareModal = (
    <ShareDocumentModal
      isOpen={isOpen}
      documentId={documentId}
      flow={flow}
      steps={outline}
      screenshotUrls={screenshotUrls}
      shareSettings={shareSettings ?? undefined}
      onClose={() => setIsOpen(false)}
      onShareSettingsSave={(settings) => {
        updateShareSettings(settings);
        void persistCurrentFlow(documentId);
      }}
    />
  );

  return {
    openShare: () => setIsOpen(true),
    shareModal,
  };
}
