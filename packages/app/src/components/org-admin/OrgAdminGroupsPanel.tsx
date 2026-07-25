import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, UsersRound } from 'lucide-react';
import { CapabilityChipGrid } from '@/components/org-admin/CapabilityChipGrid';
import {
  createOrganizationGroup,
  deleteOrganizationGroup,
  listOrganizationGroups,
  listOrganizationMembers,
  setOrganizationGroupMembers,
  updateOrganizationGroup,
} from '@/cloud/repositories/organizationRepository';
import {
  DEFAULT_MEMBER_CAPABILITIES,
  type MemberCapabilities,
  type OrganizationGroupRecord,
  type OrganizationMemberRecord,
} from '@/cloud/types/organization';
import { notifyError, notifyPromise } from '@/utils/notify';
import { refreshCloudMemberships } from '@/cloud/refreshCloudMemberships';

interface OrgAdminGroupsPanelProps {
  organizationId: string;
}

export const OrgAdminGroupsPanel = ({ organizationId }: OrgAdminGroupsPanelProps) => {
  const [groups, setGroups] = useState<OrganizationGroupRecord[]>([]);
  const [members, setMembers] = useState<OrganizationMemberRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capabilities, setCapabilities] = useState<MemberCapabilities>({
    ...DEFAULT_MEMBER_CAPABILITIES,
  });
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nextGroups, nextMembers] = await Promise.all([
        listOrganizationGroups(organizationId),
        listOrganizationMembers(organizationId),
      ]);
      setGroups(nextGroups);
      setMembers(nextMembers.filter((member) => member.status === 'active'));
    } catch (error) {
      notifyError(error, 'Load organization groups');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setCapabilities({ ...DEFAULT_MEMBER_CAPABILITIES });
    setSelectedMemberIds([]);
  };

  const startEdit = (group: OrganizationGroupRecord) => {
    setEditingId(group.id);
    setName(group.name);
    setDescription(group.description);
    setCapabilities({ ...group.capabilities });
    setSelectedMemberIds([...group.memberIds]);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      notifyError(new Error('Group name is required.'), 'Save group');
      return;
    }

    setBusy(true);
    try {
      await notifyPromise(
        (async () => {
          if (editingId) {
            await updateOrganizationGroup({
              groupId: editingId,
              name: trimmed,
              description,
              capabilities,
            });
            await setOrganizationGroupMembers(editingId, selectedMemberIds);
          } else {
            const created = await createOrganizationGroup({
              organizationId,
              name: trimmed,
              description,
              capabilities,
            });
            await setOrganizationGroupMembers(created.id, selectedMemberIds);
          }
          await refresh();
          await refreshCloudMemberships();
          resetForm();
        })(),
        {
          loading: editingId ? 'Updating group…' : 'Creating group…',
          success: editingId ? 'Group updated' : 'Group created',
          context: 'Save organization group',
        },
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!window.confirm('Delete this group? Members keep their personal capabilities.')) return;
    setBusy(true);
    try {
      await notifyPromise(deleteOrganizationGroup(groupId).then(() => refresh()), {
        loading: 'Deleting group…',
        success: 'Group deleted',
        context: 'Delete organization group',
      });
      if (editingId === groupId) resetForm();
      await refreshCloudMemberships();
    } finally {
      setBusy(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-peacock-50 p-2 text-peacock-700 ring-1 ring-peacock-100">
            <UsersRound className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Edit group' : 'Create group'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Groups carry workspace-wide access rules. Members inherit the group&apos;s
              capabilities in addition to their personal settings.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-peacock-500 focus:border-peacock-300 focus:ring-2"
              placeholder="e.g. Editors"
              disabled={busy}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Description
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-peacock-500 focus:border-peacock-300 focus:ring-2"
              placeholder="Optional"
              disabled={busy}
            />
          </label>
          <div>
            <p className="text-sm font-medium text-slate-700">Access rules</p>
            <div className="mt-2">
              <CapabilityChipGrid
                value={capabilities}
                onChange={setCapabilities}
                disabled={busy}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Members</p>
            <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
              {members.length === 0 ? (
                <p className="px-2 py-3 text-sm text-slate-500">No active members yet.</p>
              ) : (
                members.map((member) => (
                  <label
                    key={member.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.includes(member.id)}
                      onChange={() => toggleMember(member.id)}
                      disabled={busy}
                    />
                    <span className="truncate">{member.email}</span>
                    <span className="ml-auto text-xs uppercase tracking-wide text-slate-400">
                      {member.role}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-peacock-600 px-4 py-2 text-sm font-semibold text-white hover:bg-peacock-700 disabled:opacity-50"
            >
              {editingId ? <Pencil className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
              {editingId ? 'Save group' : 'Create group'}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                disabled={busy}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Existing groups</h3>
        {isLoading ? (
          <p className="mt-3 text-sm text-slate-500">Loading groups…</p>
        ) : groups.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No groups yet. Create one above.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {groups.map((group) => (
              <li
                key={group.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{group.name}</p>
                  <p className="text-sm text-slate-500">
                    {group.memberIds.length} member{group.memberIds.length === 1 ? '' : 's'}
                    {group.description ? ` · ${group.description}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(group)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(group.id)}
                    className="rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
