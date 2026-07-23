/**
 * Canonical product analytics event names. Prefer these over ad-hoc strings
 * so PostHog insights stay consistent. Autocapture still records raw clicks;
 * these are named, intentional product events.
 */
export const AnalyticsEvents = {
  analyticsEnabled: 'analytics_enabled',
  consentAccepted: 'consent_accepted',
  consentRejected: 'consent_rejected',

  pageView: '$pageview',
  hardErrorViewed: 'hard_error_viewed',
  softErrorShown: 'soft_error_shown',
  exceptionCaptured: 'exception_captured',

  documentDeleted: 'document_deleted',
  documentShared: 'document_shared',
  documentEmbedded: 'document_embedded',
  documentPdfExported: 'document_pdf_exported',
  documentSaved: 'document_saved',

  tourDeleted: 'tour_deleted',
  tourShared: 'tour_shared',
  tourEmbedded: 'tour_embedded',
  tourPdfExported: 'tour_pdf_exported',

  routeDeleted: 'route_deleted',
  routeShared: 'route_shared',
  routePdfExported: 'route_pdf_exported',

  artifactGenerated: 'artifact_generated',
  artifactRegenerated: 'artifact_regenerated',
  artifactDownloaded: 'artifact_downloaded',

  workspaceCreatedPersonal: 'workspace_created_personal',
  workspaceCreatedTeam: 'workspace_created_team',
  workspaceInviteAccepted: 'workspace_invite_accepted',
  workspaceSwitched: 'workspace_switched',

  memberInvited: 'member_invited',
  memberInviteResent: 'member_invite_resent',
  memberInviteRevoked: 'member_invite_revoked',
  memberCapabilitiesUpdated: 'member_capabilities_updated',
  memberStatusUpdated: 'member_status_updated',

  localLibraryImported: 'local_library_imported',
  betaPricingInterest: 'beta_pricing_interest',

  actionSucceeded: 'action_succeeded',
  actionFailed: 'action_failed',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
