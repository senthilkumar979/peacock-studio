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

    const { data: existing, error: existingError } = await supabase
      .from('screenshot_assets')
      .select('id, storage_path, byte_size')
      .eq('organization_id', organizationId)
      .eq('content_hash', contentHash)
      .maybeSingle();

    if (existingError) throw existingError;

    let storagePath = existing?.storage_path as string | undefined;
    let byteSize = Number(existing?.byte_size ?? 0);
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

    const { error: upsertError } = await supabase.from('screenshot_assets').upsert(
      {
        id: screenshotId,
        organization_id: organizationId,
        document_id: documentId,
        storage_path: storagePath,
        content_hash: contentHash,
        byte_size: byteSize,
      },
      { onConflict: 'organization_id,document_id,id' },
    );

    if (upsertError) throw upsertError;

    if (storageDelta > 0) {
      await incrementOrganizationStorageBytes(storageDelta);
    }
  }
}

export async function deleteDocumentScreenshots(documentId: string): Promise<void> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('screenshot_assets')
    .select('storage_path, byte_size, content_hash')
    .eq('organization_id', organizationId)
    .eq('document_id', documentId);

  if (error) throw error;
  if (!data?.length) return;

  const paths = data.map((row) => row.storage_path);

  const { error: storageError } = await supabase.storage
    .from(SCREENSHOTS_BUCKET)
    .remove(paths);

  if (storageError) throw storageError;

  const { error: deleteError } = await supabase
    .from('screenshot_assets')
    .delete()
    .eq('organization_id', organizationId)
    .eq('document_id', documentId);

  if (deleteError) throw deleteError;

  const reclaimedBytes = data.reduce((sum, row) => sum + Number(row.byte_size), 0);
  if (reclaimedBytes > 0) {
    await adjustOrganizationStorageBytes(-reclaimedBytes);
  }
}

export type { ScreenshotAssetRow };
