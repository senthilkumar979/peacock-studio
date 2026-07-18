export type ConsentCategoryId = 'necessary' | 'analytics';

export interface ConsentRecord {
  version: number;
  decidedAt: string;
  analytics: boolean;
}

export interface ConsentCategoryMeta {
  id: ConsentCategoryId;
  label: string;
  description: string;
  required: boolean;
}
