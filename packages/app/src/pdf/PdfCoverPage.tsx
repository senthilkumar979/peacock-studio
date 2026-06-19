import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { FlowPayload } from '@peacock/shared';
import { PdfPageFooter } from './PdfPageChrome';
import { PDF_COLORS, PDF_FONT_FAMILY } from './pdfTheme';
import { hasPdfCaptureEnvironment } from './pdfCaptureEnvironment';

const styles = StyleSheet.create({
  page: {
    paddingTop: 72,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontFamily: PDF_FONT_FAMILY,
    backgroundColor: '#ffffff',
  },
  eyebrow: {
    fontSize: 10,
    color: PDF_COLORS.primary,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.25,
    marginBottom: 12,
  },
  description: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 1.55,
    marginBottom: 20,
    maxWidth: 480,
  },
  versionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c4b5fd',
    backgroundColor: '#f5f3ff',
    marginBottom: 20,
  },
  versionBadgeText: {
    fontSize: 9,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 700,
    color: '#6d28d9',
  },
  metaCard: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metaLabel: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 11,
    color: '#334155',
    fontWeight: 700,
  },
  metaCol: {
    minWidth: 90,
  },
  metaColSpaced: {
    minWidth: 90,
    marginLeft: 28,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  metaSectionLabel: {
    fontSize: 9,
    color: PDF_COLORS.primary,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  emptyDescription: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 20,
  },
});

interface PdfCoverPageProps {
  flow: FlowPayload;
  stepCount: number;
  logoSrc: string;
}

export const PdfCoverPage = ({ flow, stepCount, logoSrc }: PdfCoverPageProps) => {
  const createdAt = new Date(flow.metadata.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const version = flow.flow.version.trim();
  const description = flow.flow.description.trim();

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.eyebrow}>Flow details</Text>
      <Text style={styles.title}>{flow.flow.title || 'Untitled Flow'}</Text>

      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : (
        <Text style={styles.emptyDescription}>No description provided.</Text>
      )}

      <View style={styles.versionBadge}>
        <Text style={styles.versionBadgeText}>
          {version ? `Version ${version}` : 'Unversioned'}
        </Text>
      </View>

      <View style={styles.metaCard}>
        <Text style={styles.metaSectionLabel}>Overview</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Steps</Text>
            <Text style={styles.metaValue}>{stepCount}</Text>
          </View>
          <View style={styles.metaColSpaced}>
            <Text style={styles.metaLabel}>Recorded</Text>
            <Text style={styles.metaValue}>{createdAt}</Text>
          </View>
          {hasPdfCaptureEnvironment(flow.metadata.captureEnvironment) ? (
            <View style={styles.metaColSpaced}>
              <Text style={styles.metaLabel}>Capture metadata</Text>
              <Text style={styles.metaValue}>Included on next page</Text>
            </View>
          ) : null}
        </View>
      </View>

      <PdfPageFooter logoSrc={logoSrc} />
    </Page>
  );
};
