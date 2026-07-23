import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Shield, Trash2 } from 'lucide-react';
import {
  listShareLinksForResource,
  revokeShareLink,
} from '@/cloud/repositories/shareLinkRepository';
import type { ShareLinkRecord, ShareLinkResourceType } from '@/types/shareLink';
import { buildPublicShareUrl } from '@/utils/shareLink';
import { notifyError, notifyPromise } from '@/utils/notify';
import { reportAppError } from '@/utils/appError';

interface ShareLinkManagePanelProps {
  resourceType: ShareLinkResourceType;
  resourceId: string;
  refreshKey?: number;
}

export const ShareLinkManagePanel = ({
  resourceType,
  resourceId,
  refreshKey = 0,
}: ShareLinkManagePanelProps) => {
  const [links, setLinks] = useState<ShareLinkRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listShareLinksForResource(resourceType, resourceId);
      setLinks(rows.filter((row) => row.channel === 'link'));
    } catch (err) {
      reportAppError('List share links', err);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [resourceType, resourceId]);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey]);

  if (loading) {
    return <p className="text-xs text-slate-500">Loading active links…</p>;
  }

  if (links.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        No active token links yet. Generate a link above to create one.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active links</p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li
            key={link.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-slate-700">
                {buildPublicShareUrl(link.token, {
                  editable: link.accessMode === 'editable',
                })}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge>{link.accessMode}</Badge>
                {link.requiresAuth ? (
                  <Badge>
                    <Shield className="mr-1 h-3 w-3" aria-hidden />
                    Sign-in
                  </Badge>
                ) : null}
                <Badge>
                  {link.expiresAt
                    ? `Expires ${new Date(link.expiresAt).toLocaleDateString()}`
                    : 'No expiry'}
                </Badge>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
              onClick={() => {
                void notifyPromise(revokeShareLink(link.id).then(() => reload()), {
                  loading: 'Revoking link…',
                  success: 'Link revoked',
                  context: 'Revoke share link',
                }).catch((err) => notifyError(err, 'Revoke share link'));
              }}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Revoke
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Badge = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
    {children}
  </span>
);
