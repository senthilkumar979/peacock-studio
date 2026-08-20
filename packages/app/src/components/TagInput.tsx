import { useMemo, useState } from 'react';
import {
  MAX_FLOW_TAGS,
  normalizeFlowTags,
  parseFlowTag,
} from '@peacock/shared';
import { FieldInput } from '@/components/ui';
import { FlowTagList } from '@/components/flow/FlowTagList';

interface TagInputProps {
  tags: string[];
  suggestions?: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const TAG_ERRORS = {
  empty: 'Enter a tag that starts with a letter.',
  'invalid-start': 'Tags must start with a letter, not a number or symbol.',
  'too-long': 'Tags can be at most 30 characters.',
  limit: `You can add up to ${MAX_FLOW_TAGS} tags.`,
} as const;

export const TagInput = ({
  tags,
  suggestions = [],
  onChange,
  disabled = false,
  placeholder = 'Add a tag and press Enter',
}: TagInputProps) => {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const atLimit = tags.length >= MAX_FLOW_TAGS;
  const filteredSuggestions = useMemo(() => {
    const needle = draft.trim().toLowerCase();
    const unused = suggestions.filter((tag) => !tags.includes(tag));
    if (!needle) return unused.slice(0, 8);
    return unused.filter((tag) => tag.toLowerCase().includes(needle)).slice(0, 8);
  }, [draft, suggestions, tags]);

  const addTag = (value: string) => {
    if (atLimit) {
      setError(TAG_ERRORS.limit);
      return;
    }

    const parsed = parseFlowTag(value);
    if ('error' in parsed) {
      if (parsed.error === 'empty') {
        setDraft('');
        setError(null);
        return;
      }
      setError(TAG_ERRORS[parsed.error]);
      return;
    }

    if (tags.includes(parsed.tag)) {
      setDraft('');
      setError(null);
      return;
    }

    onChange(normalizeFlowTags([...tags, parsed.tag]));
    setDraft('');
    setError(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(draft);
    }
  };

  return (
    <div className="space-y-2">
      <FlowTagList
        tags={tags}
        onRemove={disabled ? undefined : (tag) => onChange(tags.filter((item) => item !== tag))}
      />

      <FieldInput
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setError(null);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (draft.trim()) addTag(draft);
        }}
        disabled={disabled || atLimit}
        placeholder={atLimit ? `Maximum of ${MAX_FLOW_TAGS} tags` : placeholder}
        hasError={Boolean(error)}
        list={filteredSuggestions.length ? 'tag-suggestions' : undefined}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {filteredSuggestions.length > 0 ? (
        <datalist id="tag-suggestions">
          {filteredSuggestions.map((tag) => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
      ) : null}
    </div>
  );
};
