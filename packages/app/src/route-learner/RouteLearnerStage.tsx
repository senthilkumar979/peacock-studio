import { EmptyFlowState } from '@/components/EmptyFlowState';
import { RouteBranchChoicePanel } from '@/route-learner/RouteBranchChoicePanel';
import { RouteChapterIntro } from '@/route-learner/RouteChapterIntro';
import { RouteDemoIntro } from '@/route-learner/RouteDemoIntro';
import { RouteFormPanel } from '@/route-learner/RouteFormPanel';
import { RouteInterestPanel } from '@/route-learner/RouteInterestPanel';
import { RoutePeacockPlayer } from '@/route-learner/RoutePeacockPlayer';
import type { RouteLearnerGraphState } from '@/types/route';
import { isBranchNode, isFormNode, isInterestNode, type RouteNode } from '@/types/route';
import type { SavedFlowSummary } from '@/types/savedFlow';
import type { RouteLearnerTransition } from '@/utils/routeLearnerTransitions';

interface RouteLearnerStageProps {
  pendingTransition: RouteLearnerTransition | null;
  pendingDemoSummary?: SavedFlowSummary;
  onConfirmTransition: () => void;
  currentNode?: RouteNode;
  state: RouteLearnerGraphState;
  branchActive: boolean;
  formActive: boolean;
  interestActive: boolean;
  formResponses: Record<string, string>;
  selectedTopicIds: string[];
  activeDocumentId: string | null;
  onDocumentLoaded: (count: number) => void;
  onBranchSelect: (optionId: string) => void;
  onFormChange: (fieldId: string, value: string) => void;
  onInterestToggle: (topicId: string) => void;
}

export const RouteLearnerStage = ({
  pendingTransition,
  pendingDemoSummary,
  onConfirmTransition,
  currentNode,
  state,
  branchActive,
  formActive,
  interestActive,
  formResponses,
  selectedTopicIds,
  activeDocumentId,
  onDocumentLoaded,
  onBranchSelect,
  onFormChange,
  onInterestToggle,
}: RouteLearnerStageProps) => {
  if (pendingTransition?.kind === 'chapter') {
    return <RouteChapterIntro transition={pendingTransition} onStart={onConfirmTransition} />;
  }

  if (pendingTransition?.kind === 'demo') {
    return (
      <RouteDemoIntro
        transition={pendingTransition}
        summary={pendingDemoSummary}
        onStart={onConfirmTransition}
      />
    );
  }

  if (branchActive && currentNode && isBranchNode(currentNode)) {
    return (
      <RouteBranchChoicePanel
        branch={currentNode}
        selectedOptionId={state.branchChoices[currentNode.id]}
        onSelect={onBranchSelect}
      />
    );
  }

  if (formActive && currentNode && isFormNode(currentNode)) {
    return (
      <RouteFormPanel form={currentNode} responses={formResponses} onChange={onFormChange} />
    );
  }

  if (interestActive && currentNode && isInterestNode(currentNode)) {
    return (
      <RouteInterestPanel
        interest={currentNode}
        selectedTopicIds={selectedTopicIds}
        onToggle={onInterestToggle}
      />
    );
  }

  if (activeDocumentId) {
    return (
      <RoutePeacockPlayer
        key={`${activeDocumentId}-${state.currentNodeId}-${state.peacockIndex}`}
        documentId={activeDocumentId}
        stepIndex={state.stepIndex}
        onDocumentLoaded={onDocumentLoaded}
      />
    );
  }

  return (
    <EmptyFlowState
      title="Nothing to play here"
      description="Continue to the next stop in this route."
    />
  );
};
