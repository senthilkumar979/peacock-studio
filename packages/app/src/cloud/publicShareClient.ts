import { isoToMs } from '@/cloud/audit';
import type { FlowOutlineItem, FlowPayload } from '@peacock/shared';
import { getCloudAuthContext } from '@/cloud/authContext';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/cloud/config';
import type { Persona } from '@/types/persona';
import type { ProductTour, ProductTourCompletionCta, TourFeature } from '@/types/productTour';
import type { EditableShareVerification, ResolvedShareLink, ShareLinkSettings } from '@/types/shareLink';
import type { FlowDocumentStatus, FlowShareSettings, SavedFlowDocument } from '@/types/savedFlow';
import { normalizeFlowStatus } from '@/utils/flowDocumentMeta';
import { normalizePersona } from '@/utils/normalizePersona';
import { normalizeProductTour } from '@/utils/normalizeProductTour';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';
import { getTurnstileToken } from '@/security/turnstile';

interface SharedFlowDocumentPayload {
  id: string;
  savedAt: string | number;
  updatedAt: string | number;
  createdBy?: string | null;
  updatedBy?: string | null;
  status?: FlowDocumentStatus | null;
  flow: FlowPayload;
  steps: FlowOutlineItem[];
  shareSettings?: FlowShareSettings;
}

type ShareAction = 'resolve' | 'flow' | 'tour' | 'persona' | 'screenshots';

interface CachedTurnstile {
  token: string;
  expiresAt: number;
}

let cachedTurnstile: CachedTurnstile | null = null;

async function obtainShareTurnstileToken(): Promise<string> {
  const now = Date.now();
  if (cachedTurnstile && cachedTurnstile.expiresAt > now) {
    return cachedTurnstile.token;
  }

  const token = await getTurnstileToken('resolve-share');
  cachedTurnstile = {
    token,
    expiresAt: now + 4 * 60 * 1000,
  };
  return token;
}

async function invokeResolveShare<T>(input: {
  action: ShareAction;
  token: string;
  documentId?: string;
  personaId?: string;
}): Promise<T> {
  let turnstileToken: string;
  try {
    turnstileToken = await obtainShareTurnstileToken();
  } catch (error) {
    cachedTurnstile = null;
    throw error;
  }
  const accessToken = await resolveCallerAccessToken();

  const response = await fetch(`${getSupabaseUrl()}/functions/v1/resolve-share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: getSupabaseAnonKey(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      action: input.action,
      token: input.token,
      turnstileToken,
      documentId: input.documentId,
      personaId: input.personaId,
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    data?: T;
    error?: string;
  } | null;

  if (!response.ok) {
    // Stale challenge tokens should not poison the next attempt.
    if (response.status === 403 || /turnstile|challenge|rate limit/i.test(payload?.error ?? '')) {
      cachedTurnstile = null;
    }
    throw new Error(payload?.error || `Share request failed (${response.status})`);
  }

  return payload?.data as T;
}

async function resolveCallerAccessToken(): Promise<string> {
  const session = getCloudAuthContext();
  if (session) {
    const token = await session.getAccessToken();
    if (token) return token;
  }

  return getSupabaseAnonKey();
}

export async function resolvePublicShareLink(token: string): Promise<ResolvedShareLink | null> {
  const data = await invokeResolveShare<Record<string, unknown> | null>({
    action: 'resolve',
    token,
  });
  if (!data) return null;
  return mapResolvedShareLink(data);
}

export async function fetchPublicFlowDocument(
  token: string,
  documentId: string,
): Promise<SavedFlowDocument | undefined> {
  const data = await invokeResolveShare<SharedFlowDocumentPayload | Record<string, unknown> | null>(
    {
      action: 'flow',
      token,
      documentId,
    },
  );

  if (!data || isAuthRequiredPayload(data)) return undefined;

  const payload = data as SharedFlowDocumentPayload;
  const screenshotUrls = await resolvePublicScreenshotUrls(token, documentId);

  return {
    id: payload.id,
    savedAt: isoToMs(payload.savedAt),
    updatedAt: isoToMs(payload.updatedAt),
    status: normalizeFlowStatus(payload.status, 'live'),
    createdBy: payload.createdBy ?? null,
    updatedBy: payload.updatedBy ?? null,
    flow: payload.flow,
    steps: payload.steps,
    shareSettings: payload.shareSettings,
    screenshotUrls,
  };
}

export async function fetchPublicProductTour(token: string): Promise<ProductTour | undefined> {
  const data = await invokeResolveShare<Record<string, unknown> | null>({
    action: 'tour',
    token,
  });

  if (!data || isAuthRequiredPayload(data)) return undefined;

  return normalizeProductTour({
    id: String(data.id),
    title: String(data.title),
    description: String(data.description ?? ''),
    status: data.status as ProductTour['status'],
    personaId: String(data.personaId),
    tourGoal: String(data.tourGoal ?? ''),
    features: data.features as TourFeature[],
    completionCta: (data.completionCta as ProductTourCompletionCta | null) ?? undefined,
    migratedFromRoute: Boolean(data.migratedFromRoute),
    createdAt: isoToMs(data.createdAt as string | number),
    updatedAt: isoToMs(data.updatedAt as string | number),
    createdBy: data.createdBy ? String(data.createdBy) : null,
    updatedBy: data.updatedBy ? String(data.updatedBy) : null,
  });
}

export async function fetchPublicPersona(
  token: string,
  personaId: string,
): Promise<Persona | undefined> {
  const data = await invokeResolveShare<Record<string, unknown> | null>({
    action: 'persona',
    token,
    personaId,
  });

  if (!data || isAuthRequiredPayload(data)) return undefined;

  return normalizePersona({
    id: String(data.id),
    name: String(data.name),
    occupation: String(data.occupation),
    age: data.age == null ? undefined : Number(data.age),
    shortBio: String(data.shortBio),
    defaultGoal: data.defaultGoal ? String(data.defaultGoal) : undefined,
    gender: data.gender as Persona['gender'],
    avatarId: String(data.avatarId),
    company: data.company ? String(data.company) : undefined,
    createdAt: isoToMs(data.createdAt as string | number),
    updatedAt: isoToMs(data.updatedAt as string | number),
    createdBy: data.createdBy ? String(data.createdBy) : null,
    updatedBy: data.updatedBy ? String(data.updatedBy) : null,
  });
}

export async function verifyEditableShareLink(token: string): Promise<EditableShareVerification | null> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.rpc('verify_editable_share_link', { p_token: token });

  if (error) throw error;
  if (!data) return null;

  const row = data as Record<string, unknown>;
  return {
    resourceType: row.resourceType as EditableShareVerification['resourceType'],
    resourceId: String(row.resourceId),
    organizationId: String(row.organizationId),
  };
}

async function resolvePublicScreenshotUrls(
  token: string,
  documentId: string,
): Promise<Record<string, string>> {
  const urls = await invokeResolveShare<Record<string, string> | null>({
    action: 'screenshots',
    token,
    documentId,
  });

  return urls ?? {};
}

function isAuthRequiredPayload(data: unknown): boolean {
  return Boolean(
    data &&
      typeof data === 'object' &&
      'requiresAuth' in data &&
      (data as { requiresAuth?: boolean }).requiresAuth === true &&
      !('id' in data),
  );
}

function mapResolvedShareLink(row: Record<string, unknown>): ResolvedShareLink {
  return {
    token: String(row.token),
    organizationId: String(row.organizationId),
    resourceType: row.resourceType as ResolvedShareLink['resourceType'],
    resourceId: String(row.resourceId),
    accessMode: row.accessMode as ResolvedShareLink['accessMode'],
    channel: row.channel === 'embed' ? 'embed' : 'link',
    settings: (row.settings as ShareLinkSettings | null) ?? {},
    requiresAuth: Boolean(row.requiresAuth),
    expiresAt: (row.expiresAt as string | null | undefined) ?? null,
  };
}
