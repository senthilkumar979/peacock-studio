export interface MetaManifestEntry {
  title: string;
  description: string;
  canonical?: string;
  ogImage: string;
  robots: 'index,follow' | 'noindex,nofollow';
}

export type MetaManifest = Record<string, MetaManifestEntry>;
