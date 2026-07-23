import { getAvatarIdForGender } from "@/constants/personaAvatars";
import type {
  LegacyPersonaRecord,
  Persona,
  PersonaGender,
  PersonaInput,
} from "@/types/persona";
import { useState } from "react";
import { Button, FieldInput, FieldTextarea, FormField } from "@/components/ui";
import { PersonaAvatar } from "./PersonaAvatar";

interface PersonaFormFieldsProps {
  initialPersona?: Persona | null;
  formId?: string;
  variant?: "card" | "plain";
  showActions?: boolean;
  submitLabel?: string;
  isSaving?: boolean;
  autoFocusName?: boolean;
  onSave: (input: PersonaInput) => void;
  onCancel: () => void;
}

const GENDERS: { value: PersonaGender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "neutral", label: "Neutral" },
];

function createInitialFormState(
  initialPersona?: (Persona & LegacyPersonaRecord) | null,
) {
  const gender = initialPersona?.gender ?? "neutral";

  return {
    name: initialPersona?.name ?? "",
    occupation: initialPersona?.occupation ?? initialPersona?.role ?? "",
    age: initialPersona?.age != null ? String(initialPersona.age) : "",
    shortBio:
      initialPersona?.shortBio ?? initialPersona?.shortDescription ?? "",
    gender,
    company: initialPersona?.company ?? "",
  };
}

export const PersonaFormFields = ({
  initialPersona,
  formId,
  variant = "card",
  showActions = true,
  submitLabel = "Save persona",
  isSaving = false,
  autoFocusName = false,
  onSave,
  onCancel,
}: PersonaFormFieldsProps) => {
  const initialFormState = createInitialFormState(initialPersona);
  const [name, setName] = useState(initialFormState.name);
  const [occupation, setOccupation] = useState(initialFormState.occupation);
  const [age, setAge] = useState(initialFormState.age);
  const [shortBio, setShortBio] = useState(initialFormState.shortBio);
  const [gender, setGender] = useState<PersonaGender>(initialFormState.gender);
  const [company, setCompany] = useState(initialFormState.company);
  const [error, setError] = useState<string | null>(null);

  const avatarId = getAvatarIdForGender(gender);

  const handleSubmit = (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    const trimmedName = name.trim();
    const trimmedOccupation = occupation.trim();
    const trimmedShortBio = shortBio.trim();
    const trimmedAge = age.trim();
    const parsedAge = trimmedAge ? Number.parseInt(trimmedAge, 10) : undefined;

    if (!trimmedName) {
      setError("Name is required.");
      return;
    }
    if (!trimmedOccupation) {
      setError("Occupation is required.");
      return;
    }
    if (!trimmedShortBio) {
      setError("Short bio is required.");
      return;
    }
    if (
      trimmedAge &&
      (parsedAge == null || Number.isNaN(parsedAge) || parsedAge < 1)
    ) {
      setError("Age must be a positive number.");
      return;
    }

    onSave({
      name: trimmedName,
      occupation: trimmedOccupation,
      age: parsedAge,
      shortBio: trimmedShortBio,
      gender,
      company: company.trim() || undefined,
    });
  };

  const wrapperClassName =
    variant === "card"
      ? "space-y-4 rounded-xl border border-peacock-200 bg-peacock-50/40 p-4 sm:p-5"
      : "space-y-4";

  return (
    <form
      id={formId}
      className={wrapperClassName}
      onSubmit={(event) => handleSubmit(event)}
    >
      <div className="flex items-center gap-3">
        <PersonaAvatar
          persona={{ name: name || "Persona", avatarId }}
          size="lg"
        />
      </div>

      <FormField label="Name">
        <FieldInput
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus={autoFocusName}
          disabled={isSaving}
        />
      </FormField>

      <FormField label="Occupation">
        <FieldInput
          value={occupation}
          onChange={(event) => setOccupation(event.target.value)}
          disabled={isSaving}
        />
      </FormField>

      <div className="grid grid-cols-[8rem_minmax(0,1fr)] items-start gap-4">
        <FormField label="Age (optional)">
          <FieldInput
            type="number"
            min={1}
            max={120}
            value={age}
            onChange={(event) => setAge(event.target.value)}
            disabled={isSaving}
          />
        </FormField>

        <fieldset className="min-w-0 ml-[10rem]">
          <legend className="text-sm font-medium text-slate-700">Gender</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {GENDERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGender(option.value)}
                disabled={isSaving}
                className={`rounded-lg border bg-white px-3 py-1.5 text-sm disabled:opacity-60 ${
                  gender === option.value
                    ? "border-peacock-500 bg-peacock-50 text-peacock-800"
                    : "border-slate-200 text-slate-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <FormField label="Short bio">
        <FieldTextarea
          value={shortBio}
          onChange={(event) => setShortBio(event.target.value)}
          rows={2}
          disabled={isSaving}
        />
      </FormField>

      <FormField label="Company (optional)">
        <FieldInput
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          disabled={isSaving}
        />
      </FormField>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {showActions ? (
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : submitLabel}
          </Button>
        </div>
      ) : null}
    </form>
  );
};
