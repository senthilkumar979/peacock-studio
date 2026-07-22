import { useMemo } from 'react';
import type { DashboardViewMode, SavedFlowSummary } from '@/types/savedFlow';
import { useProfileDisplayNames } from '@/hooks/useProfileDisplayNames';
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
  const emails = useMemo(
    () => summaries.flatMap((summary) => [summary.updatedBy, summary.createdBy]),
    [summaries],
  );
  const displayNamesByEmail = useProfileDisplayNames(emails);

  if (viewMode === 'card') {
    return (
      <FlowLibraryCards
        summaries={summaries}
        displayNamesByEmail={displayNamesByEmail}
        onRequestDelete={onRequestDelete}
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <FlowLibraryList
        summaries={summaries}
        displayNamesByEmail={displayNamesByEmail}
        onRequestDelete={onRequestDelete}
      />
    );
  }

  return (
    <FlowLibraryTable
      summaries={summaries}
      displayNamesByEmail={displayNamesByEmail}
      onRequestDelete={onRequestDelete}
    />
  );
};
