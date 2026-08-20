import { useFlowStore } from '@/store/flowStore';
import { fetchPageTitle } from '@/utils/fetchPageTitle';

export async function hydrateResourceLabel(resourceId: string, url: string): Promise<boolean> {
  const existing = useFlowStore.getState().stepResources.find((item) => item.id === resourceId);
  if (!existing || existing.url !== url || existing.label?.trim()) return false;

  const title = await fetchPageTitle(url);
  if (!title) return false;

  const current = useFlowStore.getState().stepResources.find((item) => item.id === resourceId);
  if (!current || current.url !== url) return false;

  useFlowStore.getState().setStepResourceLabel(resourceId, title);
  return true;
}
