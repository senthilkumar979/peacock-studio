import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = { organizationId: 'org-1', userEmail: 'user@example.com' };
const fromMock = vi.fn();
const stampAudit = vi.fn(() => ({
  createdAt: 10,
  updatedAt: 20,
  createdBy: 'user@example.com',
  updatedBy: 'user@example.com',
}));

vi.mock('@/cloud/authContext', () => ({
  requireCloudAuthContext: () => auth,
}));

vi.mock('@/cloud/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: () => ({
    from: fromMock,
    rpc: rpcMock,
  }),
}));

vi.mock('@/cloud/audit', async () => {
  const actual = await vi.importActual<typeof import('@/cloud/audit')>('@/cloud/audit');
  return {
    ...actual,
    stampAuditForCloudWrite: (...args: any[]) => (stampAudit as any)(...args),
  };
});

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  return { ...actual, createId: () => 'new-persona-id' };
});

vi.mock('@/utils/createProductTour', () => ({
  createDefaultPersona: () => ({
    id: 'default',
    name: 'Sheela',
    occupation: 'PM',
    shortBio: 'bio',
    gender: 'female',
    avatarId: 'a1',
    createdAt: 1,
    updatedAt: 1,
  }),
}));

const rpcMock = vi.fn();

import {
  cloudDeletePersona,
  cloudGetPersona,
  cloudListPersonas,
  cloudPersonaIdExistsGlobally,
  cloudSavePersona,
} from './personaRepository';

function chain(result: { data?: unknown; error?: unknown }) {
  const api: Record<string, unknown> = {};
  for (const method of [
    'select',
    'eq',
    'order',
    'maybeSingle',
    'update',
    'insert',
    'delete',
  ] as const) {
    api[method] = vi.fn(() => api);
  }
  (api as { then?: unknown }).then = (onFulfilled: (value: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled);
  return api;
}

const personaRow = {
  id: 'p1',
  name: 'Pat',
  occupation: 'Dev',
  age: 30,
  short_bio: 'bio',
  default_goal: 'goal',
  gender: 'unspecified',
  avatar_id: 'av',
  company: 'Co',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
};

describe('personaRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cloudListPersonas maps rows', async () => {
    fromMock.mockReturnValue(chain({ data: [personaRow], error: null }));
    const list = await cloudListPersonas();
    expect(list[0]).toMatchObject({ id: 'p1', name: 'Pat', shortBio: 'bio' });
  });

  it('cloudListPersonas seeds default when empty', async () => {
    fromMock
      .mockReturnValueOnce(chain({ data: [], error: null })) // list
      .mockReturnValueOnce(chain({ data: null, error: null })) // get existing for save
      .mockReturnValueOnce(chain({ data: null, error: null })) // insert
      .mockReturnValueOnce(chain({ data: { ...personaRow, id: 'new-persona-id' }, error: null }));

    const list = await cloudListPersonas();
    expect(list[0]?.id).toBe('new-persona-id');
  });

  it('cloudGetPersona returns undefined when missing', async () => {
    fromMock.mockReturnValue(chain({ data: null, error: null }));
    await expect(cloudGetPersona('x')).resolves.toBeUndefined();
  });

  it('cloudPersonaIdExistsGlobally handles rpc and migration miss', async () => {
    rpcMock.mockResolvedValueOnce({ data: true, error: null });
    await expect(cloudPersonaIdExistsGlobally('p')).resolves.toBe(true);

    rpcMock.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST202', message: 'could not find persona_id_taken' },
    });
    await expect(cloudPersonaIdExistsGlobally('p')).resolves.toBe(false);

    rpcMock.mockResolvedValueOnce({ data: null, error: { code: 'X', message: 'boom' } });
    await expect(cloudPersonaIdExistsGlobally('p')).rejects.toEqual({
      code: 'X',
      message: 'boom',
    });
  });

  it('cloudSavePersona updates existing or inserts', async () => {
    fromMock
      .mockReturnValueOnce(chain({ data: personaRow, error: null }))
      .mockReturnValueOnce(chain({ data: null, error: null }));
    await cloudSavePersona({
      id: 'p1',
      name: 'Pat',
      occupation: 'Dev',
      shortBio: 'bio',
      gender: 'neutral',
      avatarId: 'av',
      createdAt: 1,
      updatedAt: 2,
    });
    expect(fromMock.mock.results[1]?.value.update).toHaveBeenCalled();

    fromMock
      .mockReturnValueOnce(chain({ data: null, error: null }))
      .mockReturnValueOnce(chain({ data: null, error: { code: '23505', message: 'dup' } }));
    await expect(
      cloudSavePersona({
        id: 'p2',
        name: 'Pat',
        occupation: 'Dev',
        shortBio: 'bio',
        gender: 'neutral',
        avatarId: 'av',
        createdAt: 1,
        updatedAt: 2,
      }),
    ).rejects.toThrow(/already used in another workspace/);
  });

  it('cloudDeletePersona deletes by org/id', async () => {
    const api = chain({ data: null, error: null });
    fromMock.mockReturnValue(api);
    await cloudDeletePersona('p1');
    expect(api.delete).toHaveBeenCalled();
  });
});
