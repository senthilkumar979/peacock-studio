import { Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { FlowStep } from '@peacock/shared';
import { getStepMarkerPosition, getStepScreenshotUrl, getStepUrl, getStepViewport, resolveResourceLabel } from '@peacock/shared';
import { PdfPageFooter, PdfPageHeader } from './PdfPageChrome';
import { PDF_COLORS, PDF_FONT_FAMILY } from './pdfTheme';

const PDF_IMAGE_MAX_WIDTH = 503;
const PDF_IMAGE_MAX_HEIGHT = 360;
const PDF_MARKER_SIZE = 18;

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
    color: PDF_COLORS.primary,
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
  imageStage: {
    position: 'relative',
    alignSelf: 'center',
  },
  image: {
    objectFit: 'contain',
  },
  markerWrap: {
    position: 'absolute',
    marginLeft: -PDF_MARKER_SIZE / 2,
    marginTop: -PDF_MARKER_SIZE / 2,
    width: PDF_MARKER_SIZE,
    height: PDF_MARKER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: PDF_MARKER_SIZE,
    height: PDF_MARKER_SIZE,
    borderRadius: PDF_MARKER_SIZE / 2,
    backgroundColor: '#93c5fd',
    opacity: 0.55,
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: PDF_COLORS.primary,
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
  slice: import('./pdfStepLayout').PdfStepContentSlice;
  resources: import('@peacock/shared').StepResource[];
}

export const PdfStepPage = ({
  step,
  stepNumber,
  flowTitle,
  screenshotUrls,
  logoSrc,
  slice,
  resources,
}: PdfStepPageProps) => {
  const screenshotSrc = slice.showScreenshot ? getStepScreenshotUrl(step, screenshotUrls) : null;
  const stepUrl = getStepUrl(step);
  const description = slice.instructions;
  const detailedDescription = slice.detailedDescription;
  const screenshotLayout = getPdfScreenshotLayout(step);
  const marker = getStepMarkerPosition(step);
  const markerPosition =
    marker && screenshotLayout
      ? {
          left: marker.xPercent * screenshotLayout.width,
          top: marker.yPercent * screenshotLayout.height,
        }
      : null;

  return (
    <Page size="A4" style={styles.page}>
      <PdfPageHeader flowTitle={flowTitle} />
      <PdfPageFooter logoSrc={logoSrc} />

      <Text style={styles.stepBadge}>
        Step {stepNumber}
        {slice.pageCount > 1 ? ` (${slice.pageIndex + 1}/${slice.pageCount})` : ''}
      </Text>
      <Text style={styles.stepTitle}>{step.title}</Text>
      {stepUrl ? <Text style={styles.stepUrl}>{stepUrl}</Text> : null}

      {description ? (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsLabel}>Instruction</Text>
          <Text style={styles.detailsText}>{description}</Text>
        </View>
      ) : null}

      {detailedDescription ? (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsLabel}>Detailed description</Text>
          <Text style={styles.detailsText}>{detailedDescription}</Text>
        </View>
      ) : null}

      {resources.length > 0 && slice.pageIndex === 0 ? (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsLabel}>Resources</Text>
          {resources.map((resource) => (
            <Text key={resource.id} style={styles.detailsText}>
              {resolveResourceLabel(resource)}
            </Text>
          ))}
        </View>
      ) : null}

      {screenshotSrc ? (
        <View style={styles.imageFrame}>
          {screenshotLayout ? (
            <View
              style={[
                styles.imageStage,
                { width: screenshotLayout.width, height: screenshotLayout.height },
              ]}
            >
              <Image
                style={[styles.image, { width: screenshotLayout.width, height: screenshotLayout.height }]}
                src={screenshotSrc}
              />
              {markerPosition ? (
                <View
                  style={[
                    styles.markerWrap,
                    { left: markerPosition.left, top: markerPosition.top },
                  ]}
                >
                  <View style={styles.markerPulse} />
                  <View style={styles.markerDot} />
                </View>
              ) : null}
            </View>
          ) : (
            <Image style={styles.image} src={screenshotSrc} />
          )}
        </View>
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageText}>Screenshot not available</Text>
        </View>
      )}
    </Page>
  );
};

function getPdfScreenshotLayout(step: FlowStep): { width: number; height: number } | null {
  const viewport = getStepViewport(step);

  if (!viewport?.width || !viewport.height) return null;

  const scale = Math.min(
    PDF_IMAGE_MAX_WIDTH / viewport.width,
    PDF_IMAGE_MAX_HEIGHT / viewport.height
  );

  return {
    width: Math.round(viewport.width * scale),
    height: Math.round(viewport.height * scale),
  };
}
