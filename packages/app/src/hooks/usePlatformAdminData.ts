import { useEffect, useState } from 'react';
import {
  fetchPlatformOrganization,
  fetchPlatformOrganizations,
  fetchPlatformOverview,
  type PlatformOrganizationDetail,
  type PlatformOrganizationSummary,
  type PlatformOverview,
} from '@/cloud/repositories/platformAdminRepository';
import { reportAppError } from '@/utils/appError';
import { notifyError } from '@/utils/notify';

export function usePlatformAdminData(
  isPlatformSuperAdmin: boolean,
  tab: 'overview' | 'organizations',
  selectedOrgId: string | null,
) {
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [organizations, setOrganizations] = useState<PlatformOrganizationSummary[]>([]);
  const [orgDetail, setOrgDetail] = useState<PlatformOrganizationDetail | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!isPlatformSuperAdmin) return;
    let cancelled = false;
    setLoadingOverview(true);
    void fetchPlatformOverview()
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((err) => {
        const classified = reportAppError('Failed to load platform overview', err);
        if (!cancelled) notifyError(classified.title, classified.userMessage);
      })
      .finally(() => {
        if (!cancelled) setLoadingOverview(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isPlatformSuperAdmin]);

  useEffect(() => {
    if (!isPlatformSuperAdmin || tab !== 'organizations') return;
    let cancelled = false;
    setLoadingOrgs(true);
    void fetchPlatformOrganizations()
      .then((rows) => {
        if (!cancelled) setOrganizations(rows);
      })
      .catch((err) => {
        const classified = reportAppError('Failed to load organizations', err);
        if (!cancelled) notifyError(classified.title, classified.userMessage);
      })
      .finally(() => {
        if (!cancelled) setLoadingOrgs(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isPlatformSuperAdmin, tab]);

  useEffect(() => {
    if (!isPlatformSuperAdmin || !selectedOrgId) {
      setOrgDetail(null);
      return;
    }
    let cancelled = false;
    setLoadingDetail(true);
    void fetchPlatformOrganization(selectedOrgId)
      .then((detail) => {
        if (!cancelled) setOrgDetail(detail);
      })
      .catch((err) => {
        const classified = reportAppError('Failed to load organization detail', err);
        if (!cancelled) notifyError(classified.title, classified.userMessage);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isPlatformSuperAdmin, selectedOrgId]);

  return {
    overview,
    organizations,
    orgDetail,
    loadingOverview,
    loadingOrgs,
    loadingDetail,
  };
}
