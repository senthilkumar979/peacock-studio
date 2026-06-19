import { StyleSheet, Text, View } from '@react-pdf/renderer';
import type { FlowCaptureEnvironment } from '@peacock/shared';
import {
  buildCaptureDetailGroups,
  buildCaptureHighlights,
} from '@/components/flow/captureEnvironmentDisplay';
import { BRAND_COLORS } from '@/constants/branding';
import { PDF_FONT_FAMILY } from './pdfTheme';

const PDF_VIOLET = BRAND_COLORS.accentViolet;

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 9,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 700,
    color: PDF_VIOLET,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  panelSubtitle: {
    marginTop: 4,
    fontSize: 9,
    fontFamily: PDF_FONT_FAMILY,
    color: '#64748b',
    lineHeight: 1.45,
    maxWidth: 340,
  },
  sessionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#ffffff',
  },
  sessionBadgeText: {
    fontSize: 7,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 700,
    color: '#1d4ed8',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  highlightCard: {
    width: '48%',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  highlightLabel: {
    fontSize: 7,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 10,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 700,
    color: '#0f172a',
  },
  highlightDetail: {
    marginTop: 2,
    fontSize: 8,
    fontFamily: PDF_FONT_FAMILY,
    color: '#64748b',
  },
  detailCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 7,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 10,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 8,
    fontFamily: PDF_FONT_FAMILY,
    color: '#64748b',
  },
  detailValue: {
    marginTop: 2,
    fontSize: 9,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 700,
    color: '#0f172a',
  },
  userAgentText: {
    marginTop: 4,
    fontSize: 7,
    fontFamily: PDF_FONT_FAMILY,
    color: '#475569',
    lineHeight: 1.45,
  },
});

interface PdfCaptureEnvironmentPanelProps {
  environment: FlowCaptureEnvironment;
}

export const PdfCaptureEnvironmentPanel = ({ environment }: PdfCaptureEnvironmentPanelProps) => {
  const highlights = buildCaptureHighlights(environment);
  const detailGroups = buildCaptureDetailGroups(environment);

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.panelTitle}>Captured environment</Text>
          <Text style={styles.panelSubtitle}>
            Snapshot of the browser and device used when this flow was recorded.
          </Text>
        </View>
        <View style={styles.sessionBadge}>
          <Text style={styles.sessionBadgeText}>Session metadata</Text>
        </View>
      </View>

      <View style={styles.highlightsGrid}>
        {highlights.map((highlight) => (
          <View key={highlight.id} style={styles.highlightCard}>
            <Text style={styles.highlightLabel}>{highlight.label}</Text>
            <Text style={styles.highlightValue}>{highlight.value}</Text>
            {highlight.detail ? (
              <Text style={styles.highlightDetail}>{highlight.detail}</Text>
            ) : null}
          </View>
        ))}
      </View>

      {detailGroups.map((group) => (
        <View key={group.id} style={styles.detailCard}>
          <Text style={styles.detailTitle}>{group.title}</Text>
          <View style={styles.detailRow}>
            {group.items.map((item) => (
              <View key={item.label} style={styles.detailItem}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>User agent string</Text>
        <Text style={styles.userAgentText}>{environment.userAgent}</Text>
      </View>
    </View>
  );
};
