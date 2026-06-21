import type { LucideIcon } from 'lucide-react';

export interface ProductDetailCapability {
  id: string;
  title: string;
  whatItIs: string;
  benefit: string;
  icon: LucideIcon;
  imageSrc?: string;
  imageAlt?: string;
}

export interface ProductDetailCapabilityGroup {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  capabilities: ProductDetailCapability[];
}

export const getProductDetailCapabilityImage = (
  imageBase: string,
  capability: ProductDetailCapability,
): { src: string; publicPath: string } => {
  const fileName = capability.imageSrc?.split('/').pop() ?? `${capability.id}.png`;
  return {
    src: capability.imageSrc ?? `${imageBase}/${fileName}`,
    publicPath: `${imageBase}/${fileName}`,
  };
};
