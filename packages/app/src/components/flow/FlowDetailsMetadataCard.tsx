import type { FlowCaptureEnvironment } from '@peacock/shared';
import {
  FlowDetailsContextPanel,
  hasFlowDetailsMetadata,
} from '@/components/flow/FlowDetailsContextPanel';

export { hasFlowDetailsMetadata };

interface FlowDetailsMetadataCardProps {
  documentId?: string;
  captureEnvironment?: FlowCaptureEnvironment | null;
}

export const FlowDetailsMetadataCard = ({
  documentId,
  captureEnvironment,
}: FlowDetailsMetadataCardProps) => (
  <FlowDetailsContextPanel
    documentId={documentId}
    captureEnvironment={captureEnvironment}
  />
);
