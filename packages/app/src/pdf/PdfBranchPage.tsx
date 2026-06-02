import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { sortBranchPaths, type FlowBranch, type LinkedPeacockPath } from '@peacock/shared';
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
  badge: {
    alignSelf: 'flex-start',
    fontSize: 9,
    color: PDF_COLORS.primary,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: PDF_COLORS.instructionBackground,
    borderWidth: 1,
    borderColor: PDF_COLORS.instructionBorder,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 10,
    lineHeight: 1.25,
  },
  description: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 1.55,
    marginBottom: 24,
    maxWidth: 460,
  },
  selectedCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: PDF_COLORS.primary,
    backgroundColor: PDF_COLORS.instructionBackground,
    marginBottom: 16,
  },
  selectedLabel: {
    fontSize: 8,
    color: PDF_COLORS.instructionLabel,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  selectedPath: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 4,
  },
  selectedMeta: {
    fontSize: 10,
    color: '#64748b',
  },
  otherPathsBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  otherPathsLabel: {
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  otherPath: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 4,
  },
});

interface PdfBranchPageProps {
  branch: FlowBranch;
  selectedPath: LinkedPeacockPath;
  flowTitle: string;
  logoSrc: string;
}

export const PdfBranchPage = ({
  branch,
  selectedPath,
  flowTitle,
  logoSrc,
}: PdfBranchPageProps) => {
  const otherPaths = sortBranchPaths(branch.paths).filter((path) => path.id !== selectedPath.id);

  return (
    <Page size="A4" style={styles.page}>
      <PdfPageHeader flowTitle={flowTitle} />
      <PdfPageFooter logoSrc={logoSrc} />

      <Text style={styles.badge}>Branch point</Text>
      <Text style={styles.title}>{branch.title}</Text>
      {branch.description ? <Text style={styles.description}>{branch.description}</Text> : null}

      <View style={styles.selectedCard}>
        <Text style={styles.selectedLabel}>Included in this PDF</Text>
        <Text style={styles.selectedPath}>{selectedPath.label}</Text>
        {selectedPath.targetTitle ? (
          <Text style={styles.selectedMeta}>From: {selectedPath.targetTitle}</Text>
        ) : null}
      </View>

      {otherPaths.length ? (
        <View style={styles.otherPathsBox}>
          <Text style={styles.otherPathsLabel}>Other paths not included</Text>
          {otherPaths.map((path) => (
            <Text key={path.id} style={styles.otherPath}>
              • {path.label}
            </Text>
          ))}
        </View>
      ) : null}
    </Page>
  );
};
