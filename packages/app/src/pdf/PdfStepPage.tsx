import { Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { FlowStep } from '@peacock/shared';
import { getStepScreenshotUrl, getStepUrl } from '@peacock/shared';
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
  stepBadge: {
    fontSize: 9,
    color: '#2563eb',
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 6,
  },
  stepUrl: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 12,
  },
  detailsBox: {
    padding: 12,
    marginBottom: 14,
    borderRadius: 6,
    backgroundColor: PDF_COLORS.instructionBackground,
    borderWidth: 1,
    borderColor: PDF_COLORS.instructionBorder,
  },
  detailsLabel: {
    fontSize: 8,
    color: PDF_COLORS.instructionLabel,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 10,
    color: PDF_COLORS.instructionText,
    lineHeight: 1.5,
  },
  imageFrame: {
    borderWidth: 1.5,
    borderColor: PDF_COLORS.imageBorder,
    borderRadius: 6,
    padding: 6,
    backgroundColor: PDF_COLORS.imageFrameBackground,
  },
  image: {
    width: '100%',
    maxHeight: 360,
    objectFit: 'contain',
  },
  noImage: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noImageText: {
    fontSize: 10,
    color: '#94a3b8',
  },
});

interface PdfStepPageProps {
  step: FlowStep;
  stepNumber: number;
  flowTitle: string;
  screenshotUrls: Record<string, string>;
  logoSrc: string;
}

export const PdfStepPage = ({
  step,
  stepNumber,
  flowTitle,
  screenshotUrls,
  logoSrc,
}: PdfStepPageProps) => {
  const screenshotSrc = getStepScreenshotUrl(step, screenshotUrls);
  const stepUrl = getStepUrl(step);
  const description = step.notes || step.generatedDescription;

  return (
    <Page size="A4" style={styles.page}>
      <PdfPageHeader flowTitle={flowTitle} />
      <PdfPageFooter logoSrc={logoSrc} />

      <Text style={styles.stepBadge}>Step {stepNumber}</Text>
      <Text style={styles.stepTitle}>{step.title}</Text>
      {stepUrl ? <Text style={styles.stepUrl}>{stepUrl}</Text> : null}

      {description ? (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsLabel}>Instruction</Text>
          <Text style={styles.detailsText}>{description}</Text>
        </View>
      ) : null}

      {screenshotSrc ? (
        <View style={styles.imageFrame}>
          <Image style={styles.image} src={screenshotSrc} />
        </View>
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageText}>Screenshot not available</Text>
        </View>
      )}
    </Page>
  );
};
