/**
 * Product stub for a future immutable admin audit log.
 * Events here are distinct from row-level created_by / updated_by stamps in cloud writes.
 */

export type AuditEventAction =
  | 'member.invited'
  | 'member.role_changed'
  | 'member.removed'
  | 'share.created'
  | 'share.revoked'
  | 'document.exported'
  | 'settings.updated';

export interface AuditEvent {
  id: string;
  organizationId: string;
  /** Actor email (stable key); display name resolved separately. */
  actorEmail: string;
  action: AuditEventAction;
  /** Optional target resource id (member, share link, document, …). */
  targetId?: string | null;
  /** Non-sensitive structured context for the event. */
  details?: Record<string, unknown>;
  createdAt: string;
}
