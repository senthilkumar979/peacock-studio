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

export interface WhenPeacockFitsBest {
  title: string;
  bullets: string[];
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
      {
        capability: 'Knowledge collaboration and rich text editing',
        peacock: 'Limited',
        confluence: 'Native',
        notion: 'Native',
        sharepoint: 'Native',
      },
      {
        capability: 'General-purpose wiki capabilities',
        peacock: 'Not designed for this use case',
        confluence: 'Native',
        notion: 'Native',
        sharepoint: 'Native',
      },
      {
        capability: 'File storage and document repositories',
        peacock: 'Limited',
        confluence: 'Strong',
        notion: 'Strong',
        sharepoint: 'Native',
      },
      {
        capability: 'Enterprise governance and permissions',
        peacock: 'Limited',
        confluence: 'Native',
        notion: 'Requires setup',
        sharepoint: 'Native',
      },
      {
        capability: 'Search across documentation assets',
        peacock: 'Limited',
        confluence: 'Native',
        notion: 'Native',
        sharepoint: 'Native',
      },
    ],
  } satisfies PlatformComparisonTable,
  whenPeacockFitsBest: {
    title: 'When Peacock fits best',
    bullets: [
      'Your organization already uses Confluence, Notion, or SharePoint but workflow documentation still falls out of date after UI changes.',
      'Operational knowledge lives in demos, Slack threads, and tribal knowledge rather than reusable artifacts.',
      'Cross-functional teams need visual guidance that business stakeholders, support agents, and auditors can follow.',
      'Product and process changes outpace the capacity to manually update screenshots and written procedures.',
      'QA and business owners need shared validation references that reflect what users actually see on screen.',
      'Compliance and security teams need evidence-ready workflow records without exposing passwords or sensitive inputs.',
    ],
  } satisfies WhenPeacockFitsBest,
} as const;
