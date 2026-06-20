export interface PlatformComparisonRow {
  capability: string;
  peacock: string;
  confluence: string;
  notion: string;
  sharepoint: string;
}

export interface PlatformComparisonTable {
  title: string;
  subtitle: string;
  columns: string[];
  rows: PlatformComparisonRow[];
}

export interface WhenPeacockFitsSignal {
  title: string;
  copy: string;
}

export interface WhenPeacockFitsBest {
  title: string;
  thesis: string;
  complement: string;
  signals: WhenPeacockFitsSignal[];
}

export const PLATFORM_COMPARISON = {
  comparisonTable: {
    title: 'Peacock vs Traditional Knowledge Platforms',
    subtitle:
      'Knowledge platforms explain what should happen. Peacock captures how work actually happens.',
    columns: ['Capability', 'Peacock Studio', 'Confluence', 'Notion', 'SharePoint'],
    rows: [
      {
        capability: 'Capture workflows directly from browser interactions',
        peacock: 'Native',
        confluence: 'Manual',
        notion: 'Manual',
        sharepoint: 'Manual',
      },
      {
        capability: 'Automatically generate step-by-step visual guides',
        peacock: 'Native',
        confluence: 'Manual',
        notion: 'Manual',
        sharepoint: 'Manual',
      },
      {
        capability: 'Editable workflow artifacts',
        peacock: 'Native',
        confluence: 'Manual',
        notion: 'Manual',
        sharepoint: 'Limited',
      },
      {
        capability: 'Reusable operational documentation',
        peacock: 'Native',
        confluence: 'Template-driven',
        notion: 'Template-driven',
        sharepoint: 'Template-driven',
      },
      {
        capability: 'Narrative product tours',
        peacock: 'Native',
        confluence: 'Not designed for this use case',
        notion: 'Not designed for this use case',
        sharepoint: 'Not designed for this use case',
      },
      {
        capability: 'Interactive experiences instead of static pages',
        peacock: 'Native',
        confluence: 'Limited',
        notion: 'Limited',
        sharepoint: 'Limited',
      },
      {
        capability: 'Documentation that evolves with UI changes',
        peacock: 'Native',
        confluence: 'Manual',
        notion: 'Manual',
        sharepoint: 'Manual',
      },
      {
        capability: 'Business-friendly UAT walkthroughs',
        peacock: 'Native',
        confluence: 'Manual',
        notion: 'Manual',
        sharepoint: 'Manual',
      },
      {
        capability: 'Support playbooks from real workflows',
        peacock: 'Native',
        confluence: 'Manual',
        notion: 'Manual',
        sharepoint: 'Manual',
      },
      {
        capability: 'Release communication experiences',
        peacock: 'Native',
        confluence: 'Manual',
        notion: 'Manual',
        sharepoint: 'Manual',
      },
      {
        capability: 'Executive-ready product storytelling',
        peacock: 'Native',
        confluence: 'Manual',
        notion: 'Manual',
        sharepoint: 'Manual',
      },
      {
        capability: 'Evidence packages for audits',
        peacock: 'Native',
        confluence: 'Manual',
        notion: 'Manual',
        sharepoint: 'Document repository',
      },
      {
        capability: 'Sensitive input protection',
        peacock: 'Native',
        confluence: 'Not designed for this use case',
        notion: 'Not designed for this use case',
        sharepoint: 'Not designed for this use case',
      },
      {
        capability: 'Password field exclusion',
        peacock: 'Native',
        confluence: 'Not designed for this use case',
        notion: 'Not designed for this use case',
        sharepoint: 'Not designed for this use case',
      },
      {
        capability: 'Environment metadata capture',
        peacock: 'Native',
        confluence: 'Limited',
        notion: 'Limited',
        sharepoint: 'Limited',
      },
    ],
  } satisfies PlatformComparisonTable,
  whenPeacockFitsBest: {
    title: 'When Peacock fits best',
    thesis: 'Your wiki explains what should happen. Peacock captures what people actually do on screen.',
    complement:
      'Peacock complements Confluence, Notion, and SharePoint — it does not replace your enterprise content repository.',
    signals: [
      {
        title: 'The UI moves faster than the docs',
        copy: 'Releases change screens rapidly; manual screenshots and procedures cannot keep up.',
      },
      {
        title: 'Walkthroughs never become assets',
        copy: 'Demos, Slack threads, and tribal knowledge do not scale across engineering, product, and support teams.',
      },
      {
        title: 'Teams need visual proof',
        copy: 'Product owners, analysts, and support agents need step-level guidance — not documentation pages alone.',
      },
    ],
  } satisfies WhenPeacockFitsBest,
} as const;
