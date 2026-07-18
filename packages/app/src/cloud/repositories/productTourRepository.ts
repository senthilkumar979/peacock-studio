import { requireCloudAuthContext } from '@/cloud/authContext';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';
import type { ProductTour, ProductTourCompletionCta, ProductTourSummary, TourFeature } from '@/types/productTour';
import type { Persona } from '@/types/persona';
import { countTourDemos, sortTourFeatures } from '@/utils/createProductTour';
import { estimateTourDurationMinutes } from '@/utils/productTourLearner';

interface ProductTourRow {
  id: string;
  title: string;
  description: string;
  status: ProductTour['status'];
  persona_id: string;
  tour_goal: string;
  features: TourFeature[];
  completion_cta: ProductTourCompletionCta | null;
  migrated_from_route: boolean;
  created_at: number;
  updated_at: number;
}

export async function cloudListProductTourSummaries(): Promise<ProductTourSummary[]> {
  const tours = await cloudListProductTours();
  const personas = await listPersonaNameMap();

  const summaries: ProductTourSummary[] = [];

  for (const tour of tours) {
    summaries.push(await toProductTourSummary(tour, personas.get(tour.personaId) ?? 'Unknown persona'));
  }

  return summaries;
}

export async function cloudGetProductTour(id: string): Promise<ProductTour | undefined> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('product_tours')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;

  return mapProductTourRow(data as ProductTourRow);
}

export async function cloudSaveProductTour(tour: ProductTour): Promise<void> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { error } = await supabase.from('product_tours').upsert(
    {
      id: tour.id,
      organization_id: organizationId,
      title: tour.title,
      description: tour.description,
      status: tour.status,
      persona_id: tour.personaId,
      tour_goal: tour.tourGoal,
      features: tour.features,
      completion_cta: tour.completionCta ?? null,
      migrated_from_route: tour.migratedFromRoute ?? false,
      created_at: tour.createdAt,
      updated_at: tour.updatedAt,
    },
    { onConflict: 'id' },
  );

  if (error) throw error;
}

export async function cloudDeleteProductTour(id: string): Promise<void> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { error } = await supabase
    .from('product_tours')
    .delete()
    .eq('organization_id', organizationId)
    .eq('id', id);

  if (error) throw error;
}

export function cloudCollectProductTourDocumentIds(tour: ProductTour): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const feature of sortTourFeatures(tour.features)) {
    for (const demo of feature.demos) {
      if (seen.has(demo.documentId)) continue;
      seen.add(demo.documentId);
      ids.push(demo.documentId);
    }
  }

  return ids;
}

async function cloudListProductTours(): Promise<ProductTour[]> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('product_tours')
    .select('*')
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => mapProductTourRow(row as ProductTourRow));
}

async function listPersonaNameMap(): Promise<Map<string, string>> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('personas')
    .select('id, name')
    .eq('organization_id', organizationId);

  if (error) throw error;

  return new Map((data ?? []).map((row) => [row.id as string, row.name as string]));
}

async function toProductTourSummary(
  tour: ProductTour,
  personaName: string,
): Promise<ProductTourSummary> {
  const estimatedMinutes = await estimateTourDurationMinutes(tour);

  return {
    id: tour.id,
    title: tour.title.trim() || 'Untitled product tour',
    description: tour.description.trim(),
    status: tour.status,
    personaId: tour.personaId,
    personaName,
    tourGoal: tour.tourGoal.trim(),
    featureCount: sortTourFeatures(tour.features).length,
    demoCount: countTourDemos(tour),
    estimatedMinutes,
    createdAt: tour.createdAt,
    updatedAt: tour.updatedAt,
  };
}

function mapProductTourRow(row: ProductTourRow): ProductTour {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    personaId: row.persona_id,
    tourGoal: row.tour_goal,
    features: row.features,
    completionCta: row.completion_cta ?? undefined,
    migratedFromRoute: row.migrated_from_route,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}
