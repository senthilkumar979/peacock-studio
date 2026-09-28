import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { DASHBOARD_PATH } from '@/constants/routes';
import { getExtensionGatePath } from '@/utils/extensionGate';
import { FREE_FEATURE_GROUPS } from './pricingData';

export const FreeFeaturesSection = () => (
  <section className="landing-section-light">
    <div className="landing-section-inner">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700">
          What&apos;s included
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          One product. No paid tiers.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
          Every available Peacock feature is included. You never need to compare plans or upgrade
          to unlock the workflow you need.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {FREE_FEATURE_GROUPS.map((group, index) => {
          const Icon = group.icon;
          return (
            <motion.article
              key={group.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="inline-flex w-fit rounded-xl bg-peacock-50 p-3 text-peacock-700">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-xl font-bold text-slate-900">{group.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{group.description}</p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {group.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-peacock-600" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link
          to={getExtensionGatePath(DASHBOARD_PATH)}
          className="inline-flex items-center justify-center rounded-lg bg-peacock-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-peacock-700"
        >
          Start using Peacock
        </Link>
      </div>
    </div>
  </section>
);
