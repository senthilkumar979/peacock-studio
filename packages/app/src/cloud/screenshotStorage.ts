import {
  SCREENSHOTS_BUCKET,
  SIGNED_URL_TTL_SECONDS,
} from '@/cloud/config';
import { requireCloudAuthContext } from '@/cloud/authContext';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';
import { adjustOrganizationStorageBytes, incrementOrganizationStorageBytes } from '@/cloud/ensureOrganization';
import {
  buildScreenshotStoragePath,
  inlineScreenshotToBlob,
  isInlineScreenshotUrl,
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

export async function syncDocumentScreenshots(
  documentId: string,
  screenshotUrls: Record<string, string>,
): Promise<void> {
  const entries = Object.entries(screenshotUrls);
  if (!entries.length) return;

  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  for (const [screenshotId, url] of entries) {
    if (!isInlineScreenshotUrl(url)) continue;

    const blob = await inlineScreenshotToBlob(url);
    if (!blob) continue;
    const contentHash = await sha256HexFromBlob(blob);

    const existing = await findExistingAssetByHash(organizationId, contentHash);

    let storagePath = existing?.storage_path;
    let byteSize = existing?.byte_size ?? 0;
    let storageDelta = 0;

    if (!storagePath) {
      storagePath = buildScreenshotStoragePath(organizationId, documentId, screenshotId);
      byteSize = blob.size;
      storageDelta = blob.size;

      const { error: uploadError } = await supabase.storage
        .from(SCREENSHOTS_BUCKET)
        .upload(storagePath, blob, {
          contentType: blob.type || 'image/png',
          upsert: true,
        });

      if (uploadError) throw uploadError;
    }

    await upsertScreenshotAsset({
      organizationId,
      documentId,
      screenshotId,
      storagePath,
      contentHash,
      byteSize,
    });

    if (storageDelta > 0) {
      await incrementOrganizationStorageBytes(storageDelta);
    }
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
    .select('storage_path, byte_size')
    .eq('organization_id', organizationId)
    .eq('document_id', documentId);

  if (error) throw error;
  if (!data?.length) return;

  const candidatePaths = [...new Set(data.map((row) => row.storage_path))];
  const reclaimedByPath = new Map(
    data.map((row) => [row.storage_path, Number(row.byte_size)] as const),
  );

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

  const reclaimedBytes = orphanedPaths.reduce(
    (sum, path) => sum + (reclaimedByPath.get(path) ?? 0),
    0,
  );

  if (reclaimedBytes > 0) {
    await adjustOrganizationStorageBytes(-reclaimedBytes);
  }
}

export type { ScreenshotAssetRow };
