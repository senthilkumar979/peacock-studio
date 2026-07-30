/**
 * Canonical product analytics event names. Prefer these over ad-hoc strings
 * so PostHog insights stay consistent. Autocapture still records raw clicks;
 * these are named, intentional product events.
 */
export const AnalyticsEvents = {
  acquisitionContextCaptured: 'acquisition_context_captured',
  analyticsEnabled: 'analytics_enabled',
  consentAccepted: 'consent_accepted',
  consentRejected: 'consent_rejected',

  pageView: '$pageview',
  hardErrorViewed: 'hard_error_viewed',
  softErrorShown: 'soft_error_shown',
  exceptionCaptured: 'exception_captured',

  userSignedIn: 'user_signed_in',

  extensionGateViewed: 'extension_gate_viewed',
  extensionDetected: 'extension_detected',
  extensionInstallCtaClicked: 'extension_install_cta_clicked',

  documentCreated: 'document_created',
  documentDeleted: 'document_deleted',
  documentShared: 'document_shared',
  documentEmbedded: 'document_embedded',
  documentPdfExported: 'document_pdf_exported',
  /** First successful persist for a document in this browser session (activation). */
  documentFirstSaved: 'document_first_saved',
  /** Kept for backwards compatibility; prefer documentFirstSaved for funnels. */
  documentSaved: 'document_saved',

  tourCreated: 'tour_created',
  tourDeleted: 'tour_deleted',
  tourShared: 'tour_shared',
  tourEmbedded: 'tour_embedded',
  tourPdfExported: 'tour_pdf_exported',

  editorOpened: 'editor_opened',
  playerOpened: 'player_opened',

  routeDeleted: 'route_deleted',
  routeShared: 'route_shared',
  routePdfExported: 'route_pdf_exported',

  artifactGenerated: 'artifact_generated',
  artifactRegenerated: 'artifact_regenerated',
  artifactDownloaded: 'artifact_downloaded',

  flowMapEditModeToggled: 'flow_map_edit_mode_toggled',
  flowMapOverlaySaved: 'flow_map_overlay_saved',
  flowMapLayoutReset: 'flow_map_layout_reset',

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
  captureBlockedMobile: 'capture_blocked_mobile',

  actionSucceeded: 'action_succeeded',
  actionFailed: 'action_failed',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
