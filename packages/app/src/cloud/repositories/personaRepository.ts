import { createId } from '@peacock/shared';
import { isoToMs, msToIso, stampAuditForCloudWrite } from '@/cloud/audit';
import { requireCloudAuthContext } from '@/cloud/authContext';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';
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
  created_at: string | number;
  updated_at: string | number;
  created_by?: string | null;
  updated_by?: string | null;
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
    const created = await ensureDefaultCloudPersona();
    return created ? [created] : [];
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

/** True when `id` is already used as personas PK in any organization. */
export async function cloudPersonaIdExistsGlobally(id: string): Promise<boolean> {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase.rpc('persona_id_taken', { p_id: id });
  if (error) {
    // Migration not applied yet — optimistic false; insert surfaces 23505.
    if (error.code === 'PGRST202' || /persona_id_taken|could not find/i.test(error.message)) {
      return false;
    }
    throw error;
  }
  return Boolean(data);
}

export async function cloudSavePersona(
  persona: Persona,
  options: { preserveUpdatedAt?: boolean } = {},
): Promise<void> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();
  const audit = stampAuditForCloudWrite(
    {
      createdAt: persona.createdAt,
      updatedAt: persona.updatedAt,
      createdBy: persona.createdBy,
      updatedBy: persona.updatedBy,
    },
    options,
  );

  const row = {
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
    created_at: msToIso(audit.createdAt),
    updated_at: msToIso(audit.updatedAt),
    created_by: audit.createdBy,
    updated_by: audit.updatedBy,
  };

  // personas.id is a global PK. Prefer org-scoped insert/update over upsert-on-id
  // so a shared guest id (e.g. peacock-default-persona) cannot UPDATE another org's row.
  const existingInOrg = await cloudGetPersona(persona.id);
  if (existingInOrg) {
    const { error } = await supabase
      .from('personas')
      .update(row)
      .eq('organization_id', organizationId)
      .eq('id', persona.id);
    if (error) throw error;
    return;
  }

  const { error: insertError } = await supabase.from('personas').insert(row);
  if (!insertError) return;

  if (insertError.code === '23505') {
    throw new Error(
      'This persona id is already used in another workspace. Create the persona again to get a new id.',
    );
  }

  throw insertError;
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
    createdAt: isoToMs(row.created_at),
    updatedAt: isoToMs(row.updated_at),
    createdBy: row.created_by ?? null,
    updatedBy: row.updated_by ?? null,
  });
}

/**
 * Seed one default persona per org. Never reuse the local IndexedDB default id —
 * personas.id is globally unique, so a shared id collides across organizations
 * (Sentry PEACOCK-STUDIO-Q / PEACOCK-STUDIO-G).
 */
async function ensureDefaultCloudPersona(): Promise<Persona | undefined> {
  const persona: Persona = {
    ...createDefaultPersona(),
    id: createId(),
  };
  await cloudSavePersona(persona);
  return cloudGetPersona(persona.id);
}
