import type { FlowOutlineItem, FlowPayload } from '@peacock/shared';
import { SCREENSHOTS_BUCKET, SIGNED_URL_TTL_SECONDS } from '@/cloud/config';
import { getPublicSupabaseClient } from '@/cloud/publicSupabaseClient';
import type { Persona } from '@/types/persona';
import type { ProductTour, ProductTourCompletionCta, TourFeature } from '@/types/productTour';
import type { EditableShareVerification, ResolvedShareLink, ShareLinkSettings } from '@/types/shareLink';
import type { FlowShareSettings, SavedFlowDocument } from '@/types/savedFlow';
import { normalizePersona } from '@/utils/normalizePersona';
import { normalizeProductTour } from '@/utils/normalizeProductTour';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';

interface SharedFlowDocumentPayload {
  id: string;
  savedAt: number;
  updatedAt: number;
  flow: FlowPayload;
  steps: FlowOutlineItem[];
  shareSettings?: FlowShareSettings;
}

interface SharedScreenshotAsset {
  id: string;
  storagePath: string;
}

export async function resolvePublicShareLink(token: string): Promise<ResolvedShareLink | null> {
  const supabase = getPublicSupabaseClient();
  const { data, error } = await supabase.rpc('resolve_share_link', { p_token: token });

  if (error) throw error;
  if (!data) return null;

  return mapResolvedShareLink(data as Record<string, unknown>);
}

export async function fetchPublicFlowDocument(
  token: string,
  documentId: string,
): Promise<SavedFlowDocument | undefined> {
  const supabase = getPublicSupabaseClient();
  const { data, error } = await supabase.rpc('get_shared_flow_document', {
    p_token: token,
    p_document_id: documentId,
  });

  if (error) throw error;
  if (!data) return undefined;

  const payload = data as SharedFlowDocumentPayload;
  const screenshotUrls = await resolvePublicScreenshotUrls(token, documentId);

  return {
    id: payload.id,
    savedAt: Number(payload.savedAt),
    updatedAt: Number(payload.updatedAt),
    flow: payload.flow,
    steps: payload.steps,
    shareSettings: payload.shareSettings,
    screenshotUrls,
  };
}

export async function fetchPublicProductTour(token: string): Promise<ProductTour | undefined> {
  const supabase = getPublicSupabaseClient();
  const { data, error } = await supabase.rpc('get_shared_product_tour', { p_token: token });

  if (error) throw error;
  if (!data) return undefined;

  const row = data as Record<string, unknown>;
  return normalizeProductTour({
    id: String(row.id),
    title: String(row.title),
    description: String(row.description ?? ''),
    status: row.status as ProductTour['status'],
    personaId: String(row.personaId),
    tourGoal: String(row.tourGoal ?? ''),
    features: row.features as TourFeature[],
    completionCta: (row.completionCta as ProductTourCompletionCta | null) ?? undefined,
    migratedFromRoute: Boolean(row.migratedFromRoute),
    createdAt: Number(row.createdAt),
    updatedAt: Number(row.updatedAt),
  });
}

export async function fetchPublicPersona(
  token: string,
  personaId: string,
): Promise<Persona | undefined> {
  const supabase = getPublicSupabaseClient();
  const { data, error } = await supabase.rpc('get_shared_persona', {
    p_token: token,
    p_persona_id: personaId,
  });

  if (error) throw error;
  if (!data) return undefined;

  const row = data as Record<string, unknown>;
  return normalizePersona({
    id: String(row.id),
    name: String(row.name),
    occupation: String(row.occupation),
    age: row.age == null ? undefined : Number(row.age),
    shortBio: String(row.shortBio),
    defaultGoal: row.defaultGoal ? String(row.defaultGoal) : undefined,
    gender: row.gender as Persona['gender'],
    avatarId: String(row.avatarId),
    company: row.company ? String(row.company) : undefined,
    createdAt: Number(row.createdAt),
    updatedAt: Number(row.updatedAt),
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
  const supabase = getPublicSupabaseClient();
  const { data, error } = await supabase.rpc('list_shared_screenshot_assets', {
    p_token: token,
    p_document_id: documentId,
  });

  if (error) throw error;

  const assets = (data ?? []) as SharedScreenshotAsset[];
  if (!assets.length) return {};

  const urls: Record<string, string> = {};

  await Promise.all(
    assets.map(async (asset) => {
      const { data: signed, error: signError } = await supabase.storage
        .from(SCREENSHOTS_BUCKET)
        .createSignedUrl(asset.storagePath, SIGNED_URL_TTL_SECONDS);

      if (signError) throw signError;
      if (signed?.signedUrl) urls[asset.id] = signed.signedUrl;
    }),
  );

  return urls;
}

function mapResolvedShareLink(row: Record<string, unknown>): ResolvedShareLink {
  return {
    token: String(row.token),
    organizationId: String(row.organizationId),
    resourceType: row.resourceType as ResolvedShareLink['resourceType'],
    resourceId: String(row.resourceId),
    accessMode: row.accessMode as ResolvedShareLink['accessMode'],
    settings: (row.settings as ShareLinkSettings | null) ?? {},
  };
}
