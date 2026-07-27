import { LEGAL_ENTITY } from '@/constants/legal';

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

const { companyName, supportEmail, websiteUrl, governingLaw } = LEGAL_ENTITY;

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: 'Overview',
    paragraphs: [
      `This policy explains how ${companyName} ("Peacock", "we") handles information when you use the Peacock web app and browser extension. You can try Peacock as a guest with data stored in your browser; when you sign in, your library may sync to our cloud providers to support cross-device access, team workspaces, and sharing.`,
    ],
  },
  {
    heading: 'Information we process',
    paragraphs: ['While you actively record or edit a workflow, Peacock may process:'],
    bullets: [
      'Page URLs and titles of the pages you choose to document',
      'Screenshots of the pages being documented',
      'Interaction metadata such as clicks, typed field context, and navigation events',
      'Documentation metadata such as flow titles, descriptions, and timestamps',
    ],
  },
  {
    heading: 'How we use information',
    bullets: [
      'Create step-by-step documentation from recorded workflows',
      'Show screenshots and step context in the editor and player',
      'Export documentation to formats such as PDF',
      'Support comparison, playback, and sharing features',
    ],
  },
  {
    heading: 'Cookies & similar technologies',
    paragraphs: [
      'The web app uses browser storage (cookies, localStorage, sessionStorage, and IndexedDB) in two categories, and asks for consent before using anything non-essential. Strictly necessary storage runs the app (your local library, session state, and sign-in). Analytics storage is optional and used only after you opt in.',
      'On first visit, a consent banner lets you Accept all, Reject non-essential, or Manage preferences. You can change your choice anytime via the "Cookie preferences" link in the footer.',
    ],
  },
  {
    heading: 'Analytics & consent',
    paragraphs: [
      'If you opt in to analytics, Peacock may collect aggregate usage information (such as which pages are visited and which features are used) to help us improve the product. We do not use analytics to collect passwords, tokens, or the sensitive contents of your recordings. Analytics is disabled until you consent and stops when you withdraw consent.',
    ],
  },
  {
    heading: 'Local storage & cloud sync',
    paragraphs: [
      'As a guest, saved documentation and screenshots stay in your browser (IndexedDB) on your device. When cloud sync is enabled for your deployment and you sign in, your library is stored with our cloud provider to sync across devices, support team workspaces, and power secure share links.',
      'When cloud sync is enabled, retention of cloud-hosted library data is configured by the operator of that deployment. Guest (local-only) data remains in your browser until you clear it.',
    ],
  },
  {
    heading: 'Data sharing',
    bullets: [
      'We do not sell personal information.',
      'We do not share your recorded documentation with third parties except to provide a feature you explicitly request (such as a share link) or when required by law.',
    ],
  },
  {
    heading: 'Your controls',
    bullets: [
      'Delete saved documentation from within the app',
      'Clear your browser storage or uninstall the extension',
      'Change analytics consent anytime from "Cookie preferences"',
      `Contact ${supportEmail} for privacy requests`,
    ],
  },
  {
    heading: 'Children’s privacy',
    paragraphs: [
      'Peacock is not intended for children, and we do not knowingly collect personal information from children.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this policy from time to time. Material changes will be reflected by updating the "Last updated" date above.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [`Questions? Contact ${supportEmail} or visit ${websiteUrl}.`],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: 'Acceptance of terms',
    paragraphs: [
      `By accessing or using Peacock, you agree to these Terms & Conditions. If you do not agree, do not use the product. These terms are between you and ${companyName}.`,
    ],
  },
  {
    heading: 'Description of the service',
    paragraphs: [
      'Peacock is a browser-based flow capture and documentation platform. It records browser workflows and turns them into editable documentation, players, product tours, PDFs, and shareable links. Some capabilities depend on the browser extension and cloud sync (accounts, workspaces, and tokenized share links).',
    ],
  },
  {
    heading: 'Your data & responsibilities',
    bullets: [
      'You are responsible for the content you record and share, including any personal or confidential data captured in screenshots or step context.',
      'Use the built-in masking, blur, and redaction tools to remove sensitive information before sharing.',
      'You must have the right to record and document the websites and content you capture.',
    ],
  },
  {
    heading: 'Acceptable use',
    bullets: [
      'Do not use Peacock for unlawful purposes or to infringe the rights of others.',
      'Do not attempt to disrupt, reverse engineer, or misuse the service.',
      'Do not capture content you are not authorized to access.',
    ],
  },
  {
    heading: 'Intellectual property',
    paragraphs: [
      `Peacock and its original software, branding, and content are owned by ${companyName} and its licensors. You retain ownership of the documentation you create; these terms do not transfer ownership of your content to us.`,
    ],
  },
  {
    heading: 'Third-party services',
    paragraphs: [
      'Features such as authentication, cloud storage, and team collaboration rely on third-party providers when cloud sync is enabled. Your use of those features may also be subject to the providers’ terms.',
    ],
  },
  {
    heading: 'Disclaimer of warranties',
    paragraphs: [
      'Peacock is provided "as is" and "as available" without warranties of any kind, whether express or implied, including fitness for a particular purpose and non-infringement, to the maximum extent permitted by law.',
    ],
  },
  {
    heading: 'Limitation of liability',
    paragraphs: [
      `To the maximum extent permitted by law, ${companyName} will not be liable for any indirect, incidental, or consequential damages, or for loss of data, arising from your use of Peacock.`,
    ],
  },
  {
    heading: 'Changes to these terms',
    paragraphs: [
      'We may update these terms from time to time. Continued use after changes take effect constitutes acceptance of the updated terms.',
    ],
  },
  {
    heading: 'Governing law',
    paragraphs: [`These terms are governed by ${governingLaw}.`],
  },
  {
    heading: 'Contact',
    paragraphs: [`Questions about these terms? Contact ${supportEmail}.`],
  },
];
