import type { FlowCaptureEnvironment } from '@peacock/shared';
import { ArrowRight, Keyboard } from 'lucide-react';
import { FlowDetailsIntro } from '@/player/FlowDetailsIntro';
import {
  FlowDetailsMetadataCard,
  hasFlowDetailsMetadata,
} from '@/components/flow/FlowDetailsMetadataCard';

interface FlowDetailsOverviewLayoutProps {
  title: string;
  description: string;
  version: string;
  createdAt?: number;
  stepCount?: number;
  sectionCount?: number;
  branchCount?: number;
  variant: 'doc' | 'player' | 'hub';
  anchorId?: string;
  isActive?: boolean;
  documentId?: string;
  captureEnvironment?: FlowCaptureEnvironment | null;
}

export const FlowDetailsOverviewLayout = ({
  title,
  description,
  version,
  createdAt,
  stepCount,
  sectionCount,
  branchCount,
  variant,
  anchorId,
  isActive = false,
  documentId,
  captureEnvironment,
}: FlowDetailsOverviewLayoutProps) => {
  const isPlayer = variant === 'player';
  const isHub = variant === 'hub';
  const hasMetadata = hasFlowDetailsMetadata(documentId, captureEnvironment);

  const grid = (
    <div
      className={`grid w-full gap-5 lg:items-start xl:gap-6 ${
        hasMetadata
          ? 'xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]'
          : ''
      }`}
    >
      <FlowDetailsIntro
        variant={variant}
        title={title}
        description={description}
        version={version}
        createdAt={createdAt}
        stepCount={stepCount}
        sectionCount={sectionCount}
        branchCount={branchCount}
        fillHeight={hasMetadata}
        isActive={isActive}
      />
      {hasMetadata ? (
        <FlowDetailsMetadataCard
          documentId={documentId}
          captureEnvironment={captureEnvironment}
        />
      ) : null}
    </div>
  );

  const footerHint = isHub ? (
    <p className="mt-5 text-sm text-slate-500">
      Review deliverables and captured environment above, then choose Guide or Player below.
    </p>
  ) : isPlayer ? (
    <p className="mt-5 inline-flex items-center gap-2 text-sm text-slate-500">
      <Keyboard className="h-4 w-4 text-peacock-600" aria-hidden />
      Press Next or use arrow keys to begin the guided walkthrough.
    </p>
  ) : (
    <p className="mt-5 inline-flex items-center gap-2 text-sm text-slate-500">
      <ArrowRight className="h-4 w-4 text-peacock-600" aria-hidden />
      Follow the documented steps below, or switch to player mode for a guided walkthrough.
    </p>
  );

  if (isPlayer || isHub) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        {grid}
        {footerHint}
      </div>
    );
  }

  return (
    <section id={anchorId} className="w-full scroll-mt-24">
      {grid}
      {footerHint}
    </section>
  );
};
