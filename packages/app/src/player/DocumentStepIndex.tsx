interface DocumentStepIndexItem {
  anchorId: string;
  stepId: string;
  stepNumber: number;
  title: string;
}

interface DocumentStepIndexProps {
  items: DocumentStepIndexItem[];
  activeStepId: string | null;
}

export const DocumentStepIndex = ({ items, activeStepId }: DocumentStepIndexProps) => (
  <aside className="hidden lg:block">
    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Step index</p>
      <nav className="mt-4">
        <ol className="space-y-2">
          {items.map((item) => {
            const isActive = item.stepId === activeStepId;

            return (
              <li key={item.stepId}>
                <a
                  href={`#${item.anchorId}`}
                  className={`flex items-start gap-3 rounded-xl px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-peacock-50 text-peacock-800 ring-1 ring-peacock-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span
                    className={`mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isActive ? 'bg-peacock-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.stepNumber}
                  </span>
                  <span className="line-clamp-2 leading-5">{item.title}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  </aside>
);
