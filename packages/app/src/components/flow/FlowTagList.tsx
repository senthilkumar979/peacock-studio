import { X } from 'lucide-react';

interface FlowTagListProps {
  tags: string[];
  onRemove?: (tag: string) => void;
  className?: string;
}

export const FlowTagList = ({ tags, onRemove, className = '' }: FlowTagListProps) => {
  if (tags.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {tags.map((tag) => (
        <li key={tag}>
          <span className="inline-flex items-center gap-1 rounded-full bg-peacock-700 px-2.5 py-1 text-xs font-semibold tracking-wide text-white shadow-sm">
            <span className="text-[11px] font-bold text-peacock-200" aria-hidden>
              #
            </span>
            {tag}
            {onRemove ? (
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="rounded-full p-0.5 text-peacock-100 hover:bg-peacock-600"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
};
