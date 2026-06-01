import type { RouteInterestNode } from '@/types/route';

interface RouteInterestPanelProps {
  interest: RouteInterestNode;
  selectedTopicIds: string[];
  onToggle: (topicId: string) => void;
}

export const RouteInterestPanel = ({
  interest,
  selectedTopicIds,
  onToggle,
}: RouteInterestPanelProps) => (
  <div className="mx-auto w-full max-w-xl rounded-2xl border border-fuchsia-200 bg-white p-6 shadow-lg">
    <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-600">Choose your path</p>
    <h2 className="mt-2 text-xl font-bold text-slate-900">{interest.title}</h2>
    {interest.description ? (
      <p className="mt-2 text-sm text-slate-600">{interest.description}</p>
    ) : null}
    <ul className="mt-5 space-y-2">
      {interest.topics.map((topic) => {
        const isSelected = selectedTopicIds.includes(topic.id);
        return (
          <li key={topic.id}>
            <button
              type="button"
              onClick={() => onToggle(topic.id)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                isSelected
                  ? 'border-fuchsia-400 bg-fuchsia-50 text-fuchsia-800'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-fuchsia-200 hover:bg-white'
              }`}
            >
              {topic.label}
            </button>
          </li>
        );
      })}
    </ul>
  </div>
);
