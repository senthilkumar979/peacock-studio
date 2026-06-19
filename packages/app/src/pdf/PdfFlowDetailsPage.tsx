import { Page, StyleSheet, Text } from '@react-pdf/renderer';
import type { FlowPayload } from '@peacock/shared';
import { PdfCaptureEnvironmentPanel } from './PdfCaptureEnvironmentPanel';
import { PdfPageFooter, PdfPageHeader } from './PdfPageChrome';
import { PDF_COLORS, PDF_FONT_FAMILY } from './pdfTheme';

const styles = StyleSheet.create({
  page: {
    paddingTop: 68,
    paddingBottom: 58,
    paddingHorizontal: 40,
    fontFamily: PDF_FONT_FAMILY,
    backgroundColor: '#ffffff',
  },
  eyebrow: {
    fontSize: 9,
    color: PDF_COLORS.primary,
    fontWeight: 700,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
});

interface PdfFlowDetailsPageProps {
  flowTitle: string;
  environment: NonNullable<FlowPayload['metadata']['captureEnvironment']>;
  logoSrc: string;
}

export const PdfFlowDetailsPage = ({
  flowTitle,
  environment,
  logoSrc,
}: PdfFlowDetailsPageProps) => (
  <Page size="A4" style={styles.page}>
    <PdfPageHeader flowTitle={flowTitle} />
    <Text style={styles.eyebrow}>Session metadata</Text>
    <PdfCaptureEnvironmentPanel environment={environment} />
    <PdfPageFooter logoSrc={logoSrc} />
  </Page>
);
