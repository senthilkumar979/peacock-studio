import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { LandingSectionShell } from './LandingSectionShell';
import {
  LANDING_FEATURE_CATEGORIES,
  LANDING_FEATURES,
  type LandingFeature,
} from './landingData';

const FEATURES_BY_CATEGORY = LANDING_FEATURE_CATEGORIES.map((category) => ({
  ...category,
  features: LANDING_FEATURES.filter((feature) => feature.category === category.id),
}));

interface FeatureCardProps {
  feature: LandingFeature;
  index: number;
}

const FeatureCard = ({ feature, index }: FeatureCardProps) => {
  const Icon = feature.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-peacock-200 hover:shadow-md hover:shadow-peacock-100/40"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex rounded-xl bg-gradient-to-br from-peacock-50 to-brand-violet/10 p-2.5 text-peacock-700 ring-1 ring-peacock-100">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-peacock-600"
          aria-hidden
        />
      </div>

      <h4 className="mt-4 text-sm font-semibold text-slate-900">{feature.name}</h4>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{feature.explanation}</p>

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-peacock-600" aria-hidden />
        <span>{feature.benefit}</span>
      </p>

      <p className="mt-4 rounded-lg bg-peacock-50 px-3 py-2 text-xs font-medium leading-relaxed text-peacock-800 ring-1 ring-peacock-100/80">
        {feature.impact}
      </p>
    </motion.article>
  );
};

interface FeatureCategoryBlockProps {
  category: (typeof FEATURES_BY_CATEGORY)[number];
  blockIndex: number;
}

const FeatureCategoryBlock = ({ category, blockIndex }: FeatureCategoryBlockProps) => {
  const CategoryIcon = category.icon;
  const gridClass =
    category.features.length === 1
      ? 'grid gap-4 lg:max-w-md'
      : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: blockIndex * 0.06, duration: 0.4 }}
      aria-labelledby={`feature-category-${category.id}`}
      className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-peacock-50/40 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-peacock-100 text-peacock-700 ring-1 ring-peacock-200/60">
            <CategoryIcon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p
              id={`feature-category-${category.id}`}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700"
            >
              {category.label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{category.description}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {category.features.length} {category.features.length === 1 ? 'capability' : 'capabilities'}
          </span>
        </div>
      </div>

      <div className={`p-6 sm:p-8 ${gridClass}`}>
        {category.features.map((feature, index) => (
          <FeatureCard key={feature.name} feature={feature} index={index} />
        ))}
      </div>
    </motion.section>
  );
};

export const FeaturesSection = () => (
  <LandingSectionShell
    id="features"
    tone="muted"
    eyebrow="Features"
    title="Everything in the product, mapped to outcomes"
    description="Twelve capabilities across capture, structure, playback, and distribution — grouped the way teams actually use Peacock Studio."
  >
    <div className="mb-10 flex flex-wrap gap-3">
      {[
        `${LANDING_FEATURES.length} capabilities`,
        `${LANDING_FEATURE_CATEGORIES.length} workflow modules`,
        'Ships today · guest + cloud',
      ].map((label) => (
        <span
          key={label}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm"
        >
          {label}
        </span>
      ))}
    </div>

    <div className="space-y-6">
      {FEATURES_BY_CATEGORY.map((category, blockIndex) => (
        <FeatureCategoryBlock key={category.id} category={category} blockIndex={blockIndex} />
      ))}
    </div>
  </LandingSectionShell>
);
