import { HealthCheckRow } from '@/components/health/HealthCheckRow';
import type { HealthCategory, HealthCheckResult } from '@/types/health';

interface HealthCheckListProps {
  title: string;
  description: string;
  category: HealthCategory;
  results: HealthCheckResult[];
  hrefById?: Record<string, string>;
  emptyMessage?: string;
}

export const HealthCheckList = ({
  title,
  description,
  category,
  results,
  hrefById,
  emptyMessage = 'No checks in this category yet.',
}: HealthCheckListProps) => {
  const items = results.filter((item) => item.category === category);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500 sm:px-5">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((check) => (
            <HealthCheckRow key={check.id} check={check} href={hrefById?.[check.id]} />
          ))}
        </ul>
      )}
    </section>
  );
};
