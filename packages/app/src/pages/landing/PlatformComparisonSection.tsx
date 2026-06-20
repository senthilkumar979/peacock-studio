import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PLATFORM_COMPARISON } from './platformComparisonData';

const COLUMN_KEYS = ['peacock', 'confluence', 'notion', 'sharepoint'] as const;

const cellClass = (column: (typeof COLUMN_KEYS)[number]) => {
  if (column === 'peacock') {
    return 'bg-peacock-50/80 text-peacock-900 font-medium';
  }
  return 'text-slate-600';
};

export const PlatformComparisonSection = () => {
  const { comparisonTable, whenPeacockFitsBest } = PLATFORM_COMPARISON;

  return (
    <section id="platform-comparison" className="landing-section-muted">
      <div className="landing-section-inner">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.4 }}
          className="landing-section-header"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700">
            Category comparison
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {comparisonTable.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            {comparisonTable.subtitle}
          </p>
        </motion.header>

        <div className="landing-section-body overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {comparisonTable.columns.map((column, index) => (
                  <th
                    key={column}
                    scope="col"
                    className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wide ${
                      index === 1 ? 'bg-peacock-100/60 text-peacock-800' : 'text-slate-500'
                    }`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonTable.rows.map((row, rowIndex) => (
                <motion.tr
                  key={row.capability}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ delay: rowIndex * 0.02 }}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <th
                    scope="row"
                    className="px-4 py-3.5 align-top font-medium text-slate-900"
                  >
                    {row.capability}
                  </th>
                  {COLUMN_KEYS.map((key) => (
                    <td
                      key={key}
                      className={`px-4 py-3.5 align-top ${cellClass(key)}`}
                    >
                      {row[key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.4 }}
          className="mt-10 rounded-2xl border border-peacock-200 bg-peacock-50/50 p-6 sm:p-8"
        >
          <h3 className="text-lg font-semibold text-slate-900">{whenPeacockFitsBest.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Peacock complements existing knowledge platforms — it does not replace enterprise
            content repositories. Consider Peacock when:
          </p>
          <ul className="mt-5 space-y-3">
            {whenPeacockFitsBest.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-peacock-600" aria-hidden />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/solutions"
            className="mt-6 inline-flex text-sm font-semibold text-peacock-700 hover:text-peacock-900"
          >
            Explore solutions by role →
          </Link>
        </motion.aside>
      </div>
    </section>
  );
};
