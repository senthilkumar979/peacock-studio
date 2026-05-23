import type { DashboardViewMode, SavedFlowSummary } from '@/types/savedFlow';
import { FlowLibraryCards } from './FlowLibraryCards';
import { FlowLibraryList } from './FlowLibraryList';
import { FlowLibraryTable } from './FlowLibraryTable';

interface FlowLibrarySectionProps {
  viewMode: DashboardViewMode;
  summaries: SavedFlowSummary[];
  onRequestDelete: (summary: SavedFlowSummary) => void;
}

export const FlowLibrarySection = ({
  viewMode,
  summaries,
  onRequestDelete,
}: FlowLibrarySectionProps) => {
  if (viewMode === 'card') {
    return <FlowLibraryCards summaries={summaries} onRequestDelete={onRequestDelete} />;
  }

  if (viewMode === 'list') {
    return <FlowLibraryList summaries={summaries} onRequestDelete={onRequestDelete} />;
  }

  return <FlowLibraryTable summaries={summaries} onRequestDelete={onRequestDelete} />;
};
