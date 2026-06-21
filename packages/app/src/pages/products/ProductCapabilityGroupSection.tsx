import { motion } from 'framer-motion';
import { ProductDetailCapabilityContent } from './ProductDetailCapabilityContent';
import { ProductFeatureImage } from './ProductFeatureImage';
import type { ProductDetailCapabilityGroup } from './productCapabilityTypes';
import { getProductDetailCapabilityImage } from './productCapabilityTypes';

interface ProductCapabilityCardProps {
  capability: ProductDetailCapabilityGroup['capabilities'][number];
  index: number;
  layoutIndex: number;
  imageBase: string;
  accentClass?: string;
}

const ProductCapabilityCard = ({
  capability,
  index,
  layoutIndex,
  imageBase,
  accentClass,
}: ProductCapabilityCardProps) => {
  const image = getProductDetailCapabilityImage(imageBase, capability);
  const isImageRight = layoutIndex % 2 === 1;

  return (
    <motion.article
      id={capability.id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.04 }}
      className="scroll-mt-32 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-peacock-200/80 hover:shadow-md hover:shadow-peacock-100/30"
    >
      <div className="grid lg:grid-cols-2 lg:items-stretch">
        <div
          className={`flex items-center border-b border-slate-100 p-4 sm:p-5 lg:border-b-0 lg:p-6 ${
            isImageRight ? 'lg:order-2 lg:border-l lg:border-slate-100' : 'lg:order-1 lg:border-r'
          }`}
        >
          <ProductFeatureImage
            title={capability.title}
            imageSrc={image.src}
            imageAlt={capability.imageAlt}
            suggestedPublicPath={image.publicPath}
          />
        </div>

        <ProductDetailCapabilityContent
          capability={capability}
          layoutIndex={layoutIndex}
          isImageRight={isImageRight}
          accentClass={accentClass}
        />
      </div>
    </motion.article>
  );
};

interface ProductCapabilityGroupSectionProps {
  group: ProductDetailCapabilityGroup;
  groupIndex: number;
  capabilityStartIndex: number;
  imageBase: string;
  accentClass?: string;
  sectionIdPrefix?: string;
}

export const ProductCapabilityGroupSection = ({
  group,
  groupIndex,
  capabilityStartIndex,
  imageBase,
  accentClass,
  sectionIdPrefix = 'capability-group',
}: ProductCapabilityGroupSectionProps) => {
  const GroupIcon = group.icon;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ delay: groupIndex * 0.04 }}
      aria-labelledby={`${sectionIdPrefix}-${group.id}`}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-peacock-50/40 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-peacock-100 text-peacock-700 ring-1 ring-peacock-200/60">
            <GroupIcon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3
              id={`${sectionIdPrefix}-${group.id}`}
              className="text-xl font-bold text-slate-900 sm:text-2xl"
            >
              {group.label}
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
              {group.description}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-5 p-6 sm:p-8">
        {group.capabilities.map((capability, index) => (
          <ProductCapabilityCard
            key={capability.id}
            capability={capability}
            index={index}
            layoutIndex={capabilityStartIndex + index}
            imageBase={imageBase}
            accentClass={accentClass}
          />
        ))}
      </div>
    </motion.section>
  );
};
