export type ProductTourStatus = 'draft' | 'live';

export interface TourDemoRef {
  id: string;
  documentId: string;
  order: number;
  label?: string;
}

export interface TourFeature {
  id: string;
  title: string;
  description: string;
  order: number;
  demos: TourDemoRef[];
}

export interface ProductTourCompletionCta {
  label: string;
  url: string;
}

export interface ProductTour {
  id: string;
  title: string;
  description: string;
  status: ProductTourStatus;
  personaId: string;
  /** Why this persona is taking this tour — shown on the learner intro slide. */
  tourGoal: string;
  features: TourFeature[];
  completionCta?: ProductTourCompletionCta;
  /** Set when auto-migrated from legacy RouteHub. */
  migratedFromRoute?: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface ProductTourSummary {
  id: string;
  title: string;
  description: string;
  status: ProductTourStatus;
  personaId: string;
  personaName: string;
  tourGoal: string;
  featureCount: number;
  demoCount: number;
  estimatedMinutes: number | null;
  createdAt: number;
  updatedAt: number;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export type TourPersonaIntroSegment = { type: 'persona-intro' };
export type TourDetailsSegment = { type: 'tour-details' };
export type TourFeatureIntroSegment = {
  type: 'feature-intro';
  featureIndex: number;
};
export type TourDemoIntroSegment = {
  type: 'demo-intro';
  featureIndex: number;
  demoIndex: number;
};
export type TourDemoBranchSegment = {
  type: 'demo-branch';
  featureIndex: number;
  demoIndex: number;
  branchIndex: number;
};
export type TourDemoStepSegment = {
  type: 'demo-step';
  featureIndex: number;
  demoIndex: number;
  stepIndex: number;
};
export type TourCompleteSegment = { type: 'complete' };

export type TourLearnerSegment =
  | TourPersonaIntroSegment
  | TourDetailsSegment
  | TourFeatureIntroSegment
  | TourDemoIntroSegment
  | TourDemoBranchSegment
  | TourDemoStepSegment
  | TourCompleteSegment;
