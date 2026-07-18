import type { FlowShareSettings } from '@/types/savedFlow';
import type { ShareLinkAccessMode, SharedDocumentViewMode } from '@/utils/shareLink';

export type ShareLinkResourceType = 'document' | 'tour';

export interface ShareLinkSettings {
  viewMode?: SharedDocumentViewMode;
  presenter?: boolean;
  shareSettings?: FlowShareSettings;
  allowedDocumentIds?: string[];
}

export interface ShareLinkRecord {
  id: string;
  token: string;
  organizationId: string;
  resourceType: ShareLinkResourceType;
  resourceId: string;
  accessMode: ShareLinkAccessMode;
  settings: ShareLinkSettings;
  expiresAt: string | null;
  revokedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResolvedShareLink {
  token: string;
  organizationId: string;
  resourceType: ShareLinkResourceType;
  resourceId: string;
  accessMode: ShareLinkAccessMode;
  settings: ShareLinkSettings;
}

export interface EditableShareVerification {
  resourceType: ShareLinkResourceType;
  resourceId: string;
  organizationId: string;
}

export interface CreateShareLinkInput {
  resourceType: ShareLinkResourceType;
  resourceId: string;
  accessMode: ShareLinkAccessMode;
  settings?: ShareLinkSettings;
}
