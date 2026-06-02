import { useEffect, useId, useState } from 'react';
import {
  getAvatarsForGender,
  getDefaultAvatarId,
} from '@/constants/personaAvatars';
import type { Persona, PersonaGender, PersonaInput } from '@/types/persona';
import { PersonaAvatar } from './PersonaAvatar';

interface PersonaFormModalProps {
  isOpen: boolean;
  initialPersona?: Persona | null;
  onSave: (input: PersonaInput) => void;
  onClose: () => void;
}

const GENDERS: { value: PersonaGender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'neutral', label: 'Neutral' },
];

export const PersonaFormModal = ({
  isOpen,
  initialPersona,
  onSave,
  onClose,
}: PersonaFormModalProps) => {
  const titleId = useId();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [gender, setGender] = useState<PersonaGender>('neutral');
  const [avatarId, setAvatarId] = useState(getDefaultAvatarId('neutral'));
  const [company, setCompany] = useState('');
  const [tagline, setTagline] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(initialPersona?.name ?? '');
    setRole(initialPersona?.role ?? '');
    setShortDescription(initialPersona?.shortDescription ?? '');
    setDetailedDescription(initialPersona?.detailedDescription ?? '');
    setGender(initialPersona?.gender ?? 'neutral');
    setAvatarId(initialPersona?.avatarId ?? getDefaultAvatarId(initialPersona?.gender ?? 'neutral'));
    setCompany(initialPersona?.company ?? '');
    setTagline(initialPersona?.tagline ?? '');
    setError(null);
  }, [isOpen, initialPersona]);

  useEffect(() => {
    const avatars = getAvatarsForGender(gender);
    if (!avatars.some((avatar) => avatar.id === avatarId)) {
      setAvatarId(getDefaultAvatarId(gender));
    }
  }, [gender, avatarId]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedShort = shortDescription.trim();
    if (!trimmedName) {
      setError('Name is required.');
      return;
    }
    if (!trimmedShort) {
      setError('Short description is required.');
      return;
    }

    onSave({
      name: trimmedName,
      role: role.trim() || undefined,
      shortDescription: trimmedShort,
      detailedDescription: detailedDescription.trim() || undefined,
      gender,
      avatarId,
      company: company.trim() || undefined,
      tagline: tagline.trim() || undefined,
    });
  };

  const previewPersona = { name: name || 'Persona', avatarId };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold text-slate-900">
            {initialPersona ? 'Edit persona' : 'Create persona'}
          </h2>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="flex items-center gap-3">
            <PersonaAvatar persona={previewPersona} size="lg" />
            <p className="text-sm text-slate-500">Avatar preview</p>
          </div>

          <label className="block text-sm">
            <span className="font-medium text-slate-700">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-slate-700">Role / designation (optional)</span>
            <input
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-slate-700">Short description</span>
            <textarea
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value)}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-slate-700">Detailed description (optional)</span>
            <textarea
              value={detailedDescription}
              onChange={(event) => setDetailedDescription(event.target.value)}
              rows={3}
              className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Gender</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {GENDERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGender(option.value)}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    gender === option.value
                      ? 'border-peacock-500 bg-peacock-50 text-peacock-800'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Avatar</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {getAvatarsForGender(gender).map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setAvatarId(avatar.id)}
                  className={`rounded-xl p-1 ${avatarId === avatar.id ? 'ring-2 ring-peacock-500' : ''}`}
                >
                  <PersonaAvatar persona={{ name: 'A', avatarId: avatar.id }} size="sm" />
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block text-sm">
            <span className="font-medium text-slate-700">Company (optional)</span>
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-slate-700">Tagline (optional)</span>
            <input
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 p-5">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn-peacock">
            Save persona
          </button>
        </div>
      </div>
    </div>
  );
};
