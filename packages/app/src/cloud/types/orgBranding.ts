import { BRAND_COLORS, PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';

/** Optional white-label fields — may live on org rows or nested metadata JSON. */
export interface OrgBrandingFields {
  logoUrl?: string | null;
  primaryColor?: string | null;
}

/**
 * Org-shaped input for branding resolution.
 * No DB columns required: when `metadata` is absent, falls back to Peacock defaults.
 */
export interface OrgWithOptionalBranding extends OrgBrandingFields {
  metadata?: Record<string, unknown> | null;
}

export interface ResolvedOrgBranding {
  logoUrl: string;
  primaryColor: string;
  appName: string;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readBrandingFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): OrgBrandingFields {
  if (!metadata) return {};

  const nested = metadata.branding;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const branding = nested as Record<string, unknown>;
    return {
      logoUrl: asNonEmptyString(branding.logoUrl),
      primaryColor: asNonEmptyString(branding.primaryColor),
    };
  }

  return {
    logoUrl: asNonEmptyString(metadata.logoUrl),
    primaryColor: asNonEmptyString(metadata.primaryColor),
  };
}

/**
 * Resolves display branding for PDF/player chrome.
 * Missing or empty org fields always fall back to Peacock constants (behavior unchanged today).
 */
export function resolveOrgBranding(
  org?: OrgWithOptionalBranding | null,
): ResolvedOrgBranding {
  const fromMeta = readBrandingFromMetadata(org?.metadata);
  return {
    logoUrl: asNonEmptyString(org?.logoUrl) ?? fromMeta.logoUrl ?? PEACOCK_LOGO_SRC,
    primaryColor:
      asNonEmptyString(org?.primaryColor) ?? fromMeta.primaryColor ?? BRAND_COLORS.primary,
    appName: PEACOCK_APP_NAME,
  };
}
