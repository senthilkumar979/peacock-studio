import type { FlowSection } from '@peacock/shared';
import { FlowSectionCard } from '@/components/FlowSectionCard';

interface DocumentSectionCardProps {
  section: FlowSection;
  anchorId: string;
  isActive: boolean;
  sectionIndex: number;
}

export const DocumentSectionCard = ({
  section,
  anchorId,
  isActive,
  sectionIndex,
}: DocumentSectionCardProps) => (
  <FlowSectionCard
    section={section}
    variant="document"
    anchorId={anchorId}
    isActive={isActive}
    sectionIndex={sectionIndex}
  />
);
