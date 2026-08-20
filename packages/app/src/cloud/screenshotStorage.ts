import { collectReferencedScreenshotIds, prepareImageForCloudStorage, type FlowOutlineItem } from '@peacock/shared';
import {
  SCREENSHOTS_BUCKET,
  SIGNED_URL_TTL_SECONDS,
} from '@/cloud/config';
import { requireCloudAuthContext } from '@/cloud/authContext';
import { isPostgrestSessionError } from '@/cloud/postgrestErrors';
import { getAuthenticatedSupabaseClient, resetSupabaseClientCache } from '@/cloud/supabaseClient';
import {
  buildScreenshotStoragePath,
  inlineScreenshotToBlob,
  isInlineScreenshotUrl,
  materializeInlineScreenshotUrls,
  sha256HexFromBlob,
} from '@/cloud/screenshotUtils';

interface ScreenshotAssetRow {
  id: string;
  storage_path: string;
  content_hash: string;
  byte_size: number;
}

interface SupabaseErrorLike {
  code?: string;
  message?: string;
}

function isDuplicateContentHashError(error: unknown): boolean {
  const record = error as SupabaseErrorLike;
  return (
    record.code === '23505' &&
    Boolean(record.message?.includes('screenshot_assets_org_hash_uidx'))
  );
}

async function findExistingAssetByHash(
  organizationId: string,
  contentHash: string,
): Promise<{ storage_path: string; byte_size: number } | null> {
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('screenshot_assets')
    .select('storage_path, byte_size')
    .eq('organization_id', organizationId)
    .eq('content_hash', contentHash)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.storage_path) return null;

  return {
    storage_path: data.storage_path,
    byte_size: Number(data.byte_size ?? 0),
  };
}

export async function resolveScreenshotUrls(
  documentId: string,
): Promise<Record<string, string>> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  try {
    const { data, error } = await supabase.functions.invoke('sign-screenshots', {
      body: { documentId },
    });
    if (!error) {
      const payload = data as { data?: Record<string, string>; error?: string } | null;
      // 2xx with { error } (or empty) → fall through to Storage signed URLs
      if (payload?.data && !payload.error && Object.keys(payload.data).length > 0) {
        return payload.data;
      }
    }
  } catch {
    // Fall through — Edge rate limits / misconfig should not blank the editor.
  }

  const { data, error } = await supabase
    .from('screenshot_assets')
    .select('id, storage_path')
    .eq('organization_id', organizationId)
    .eq('document_id', documentId);

  if (error) throw error;
  if (!data?.length) return {};

  const urls: Record<string, string> = {};
  await Promise.all(
    data.map(async (row) => {
      const { data: signed, error: signError } = await supabase.storage
        .from(SCREENSHOTS_BUCKET)
        .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS);

      if (signError) throw signError;
      if (signed?.signedUrl) urls[row.id] = signed.signedUrl;
    }),
  );

  return urls;
}

async function upsertScreenshotAsset(input: {
  organizationId: string;
  documentId: string;
  screenshotId: string;
  storagePath: string;
  contentHash: string;
  byteSize: number;
}): Promise<void> {
  const supabase = getAuthenticatedSupabaseClient();

  const { error: upsertError } = await supabase.from('screenshot_assets').upsert(
    {
      id: input.screenshotId,
      organization_id: input.organizationId,
      document_id: input.documentId,
      storage_path: input.storagePath,
      content_hash: input.contentHash,
      byte_size: input.byteSize,
    },
    { onConflict: 'organization_id,document_id,id' },
  );

  if (!upsertError) return;

  if (isDuplicateContentHashError(upsertError)) {
    const existing = await findExistingAssetByHash(input.organizationId, input.contentHash);
    if (!existing) throw upsertError;

    const { error: retryError } = await supabase.from('screenshot_assets').upsert(
      {
        id: input.screenshotId,
        organization_id: input.organizationId,
        document_id: input.documentId,
        storage_path: existing.storage_path,
        content_hash: input.contentHash,
        byte_size: existing.byte_size,
      },
      { onConflict: 'organization_id,document_id,id' },
    );

    if (retryError) throw retryError;
    return;
  }

  throw upsertError;
}

async function uploadInlineScreenshot(input: {
  organizationId: string;
  documentId: string;
  screenshotId: string;
  url: string;
}): Promise<void> {
  const rawBlob = await inlineScreenshotToBlob(input.url);
  if (!rawBlob) {
    throw new Error(`Screenshot ${input.screenshotId} is no longer available in this browser session.`);
  }

  const blob = await prepareImageForCloudStorage(rawBlob);
  const contentHash = await sha256HexFromBlob(blob);
  const supabase = getAuthenticatedSupabaseClient();

  const existing = await findExistingAssetByHash(input.organizationId, contentHash);

  let storagePath = existing?.storage_path;
  let byteSize = existing?.byte_size ?? 0;

  if (!storagePath) {
    storagePath = buildScreenshotStoragePath(
      input.organizationId,
      input.documentId,
      input.screenshotId,
    );
    byteSize = blob.size;

    const { error: uploadError } = await supabase.storage
      .from(SCREENSHOTS_BUCKET)
      .upload(storagePath, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) throw uploadError;
  }

  await upsertScreenshotAsset({
    organizationId: input.organizationId,
    documentId: input.documentId,
    screenshotId: input.screenshotId,
    storagePath,
    contentHash,
    byteSize,
  });
}

export async function syncDocumentScreenshots(
  documentId: string,
  screenshotUrls: Record<string, string>,
): Promise<void> {
  const inlineOnly = Object.fromEntries(
    Object.entries(screenshotUrls).filter(([, url]) => isInlineScreenshotUrl(url)),
  );
  if (!Object.keys(inlineOnly).length) return;

  const { organizationId, getAccessToken } = requireCloudAuthContext();
  await getAccessToken();

  const materialized = await materializeInlineScreenshotUrls(documentId, inlineOnly);
  const entries = Object.entries(materialized);

  const runUploadBatch = async (): Promise<void> => {
    const failures: string[] = [];
    let sawSessionError = false;

    for (const [screenshotId, url] of entries) {
      try {
        await uploadInlineScreenshot({
          organizationId,
          documentId,
          screenshotId,
          url,
        });
      } catch (error) {
        if (isPostgrestSessionError(error)) sawSessionError = true;
        failures.push(screenshotId);
      }
    }

    if (failures.length === 0) return;

    if (sawSessionError) {
      throw new Error('JWT expired');
    }

    throw new Error(
      `Failed to upload ${failures.length} of ${entries.length} screenshots to cloud storage.`,
    );
  };

  try {
    await runUploadBatch();
  } catch (error) {
    if (!isPostgrestSessionError(error)) throw error;
    await getAccessToken();
    resetSupabaseClientCache();
    await runUploadBatch();
  }
}

export async function pruneDocumentScreenshots(
  documentId: string,
  steps: FlowOutlineItem[],
): Promise<void> {
  const keep = collectReferencedScreenshotIds(steps);
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('screenshot_assets')
    .select('id, storage_path')
    .eq('organization_id', organizationId)
    .eq('document_id', documentId);

  if (error) throw error;
  if (!data?.length) return;

  const stale = data.filter((row) => !keep.has(row.id));
  if (!stale.length) return;

  const candidatePaths = [...new Set(stale.map((row) => row.storage_path))];
  const staleIds = stale.map((row) => row.id);

  const { error: deleteError } = await supabase
    .from('screenshot_assets')
    .delete()
    .in('id', staleIds);

  if (deleteError) throw deleteError;

  const orphanedPaths = await listOrphanedStoragePaths(organizationId, candidatePaths);
  if (orphanedPaths.length) {
    const { error: storageError } = await supabase.storage
      .from(SCREENSHOTS_BUCKET)
      .remove(orphanedPaths);
    if (storageError) throw storageError;
  }
}

async function listOrphanedStoragePaths(
  organizationId: string,
  candidatePaths: string[],
): Promise<string[]> {
  if (!candidatePaths.length) return [];

  const supabase = getAuthenticatedSupabaseClient();
  const orphaned: string[] = [];

  for (const storagePath of candidatePaths) {
    const { count, error } = await supabase
      .from('screenshot_assets')
      .select('storage_path', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('storage_path', storagePath);

    if (error) throw error;
    if (!count) orphaned.push(storagePath);
  }

  return orphaned;
}

export async function deleteDocumentScreenshots(documentId: string): Promise<void> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('screenshot_assets')
    .select('storage_path')
    .eq('organization_id', organizationId)
    .eq('document_id', documentId);

  if (error) throw error;
  if (!data?.length) return;

  const candidatePaths = [...new Set(data.map((row) => row.storage_path))];

  const { error: deleteError } = await supabase
    .from('screenshot_assets')
    .delete()
    .eq('organization_id', organizationId)
    .eq('document_id', documentId);

  if (deleteError) throw deleteError;

  const orphanedPaths = await listOrphanedStoragePaths(organizationId, candidatePaths);

  if (orphanedPaths.length) {
    const { error: storageError } = await supabase.storage
      .from(SCREENSHOTS_BUCKET)
      .remove(orphanedPaths);

    if (storageError) throw storageError;
  }

  // storage_bytes is reclaimed by the screenshot_assets DELETE trigger
}

export type { ScreenshotAssetRow };
