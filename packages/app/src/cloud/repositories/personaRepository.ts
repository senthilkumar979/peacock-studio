import { requireCloudAuthContext } from '@/cloud/authContext';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';
import { DEFAULT_PERSONA_ID } from '@/constants/personaAvatars';
import type { Persona } from '@/types/persona';
import { createDefaultPersona } from '@/utils/createProductTour';
import { normalizePersona } from '@/utils/normalizePersona';

interface PersonaRow {
  id: string;
  name: string;
  occupation: string;
  age: number | null;
  short_bio: string;
  default_goal: string | null;
  gender: Persona['gender'];
  avatar_id: string;
  company: string | null;
  created_at: number;
  updated_at: number;
}

export async function cloudListPersonas(): Promise<Persona[]> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  const personas = (data ?? []).map((row) => mapPersonaRow(row as PersonaRow));

  if (personas.length === 0) {
    await ensureDefaultCloudPersona();
    const defaultPersona = await cloudGetPersona(DEFAULT_PERSONA_ID);
    return defaultPersona ? [defaultPersona] : [];
  }

  return personas;
}

export async function cloudGetPersona(id: string): Promise<Persona | undefined> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;

  return mapPersonaRow(data as PersonaRow);
}

export async function cloudSavePersona(persona: Persona): Promise<void> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { error } = await supabase.from('personas').upsert(
    {
      id: persona.id,
      organization_id: organizationId,
      name: persona.name,
      occupation: persona.occupation,
      age: persona.age ?? null,
      short_bio: persona.shortBio,
      default_goal: persona.defaultGoal ?? null,
      gender: persona.gender,
      avatar_id: persona.avatarId,
      company: persona.company ?? null,
      created_at: persona.createdAt,
      updated_at: persona.updatedAt,
    },
    { onConflict: 'id' },
  );

  if (error) throw error;
}

export async function cloudDeletePersona(id: string): Promise<void> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { error } = await supabase
    .from('personas')
    .delete()
    .eq('organization_id', organizationId)
    .eq('id', id);

  if (error) throw error;
}

function mapPersonaRow(row: PersonaRow): Persona {
  return normalizePersona({
    id: row.id,
    name: row.name,
    occupation: row.occupation,
    age: row.age ?? undefined,
    shortBio: row.short_bio,
    defaultGoal: row.default_goal ?? undefined,
    gender: row.gender,
    avatarId: row.avatar_id,
    company: row.company ?? undefined,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  });
}

async function ensureDefaultCloudPersona(): Promise<void> {
  const existing = await cloudGetPersona(DEFAULT_PERSONA_ID);

  if (existing?.name === 'Product explorer') {
    await cloudSavePersona({
      ...createDefaultPersona(),
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    });
    return;
  }

  if (!existing) {
    await cloudSavePersona(createDefaultPersona());
  }
}
