import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { FlowPayload } from '@peacock/shared';
import { PdfPageFooter } from './PdfPageChrome';
import { PDF_COLORS, PDF_FONT_FAMILY } from './pdfTheme';

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
    marginBottom: 16,
  },
  description: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 1.55,
    marginBottom: 28,
    maxWidth: 480,
  },
  metaCard: {
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
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
  metaColSecond: {
    marginLeft: 32,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 12,
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

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.eyebrow}>Flow documentation</Text>
      <Text style={styles.title}>{flow.flow.title || 'Untitled Flow'}</Text>
      {flow.flow.description ? (
        <Text style={styles.description}>{flow.flow.description}</Text>
      ) : null}

      <View style={styles.metaCard}>
        <Text style={styles.metaLabel}>Overview</Text>
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Steps</Text>
            <Text style={styles.metaValue}>{stepCount}</Text>
          </View>
          <View style={styles.metaColSecond}>
            <Text style={styles.metaLabel}>Recorded</Text>
            <Text style={styles.metaValue}>{createdAt}</Text>
          </View>
        </View>
      </View>

      <PdfPageFooter logoSrc={logoSrc} />
    </Page>
  );
};
