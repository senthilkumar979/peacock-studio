import { ExternalLink } from 'lucide-react';
import { resolveResourceLabel, type StepResource } from '@peacock/shared';

interface StepResourceListProps {
  resources: StepResource[];
  className?: string;
}

export const StepResourceList = ({ resources, className = '' }: StepResourceListProps) => {
  if (resources.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Resources
      </p>
      <ul className="mt-2 space-y-2">
        {resources.map((resource) => (
          <li key={resource.id}>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-peacock-700 transition hover:border-peacock-200 hover:bg-peacock-50"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{resolveResourceLabel(resource)}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
