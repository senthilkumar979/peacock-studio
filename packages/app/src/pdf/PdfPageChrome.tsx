import { Image, StyleSheet, Text, View } from '@react-pdf/renderer';
import { PDF_FOOTER_TAGLINE } from './pdfConstants';
import { PDF_FONT_FAMILY } from './pdfTheme';

const chromeStyles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 24,
    left: 40,
    right: 40,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 11,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 40,
    right: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLogo: {
    width: 18,
    height: 18,
    objectFit: 'contain',
    marginRight: 8,
  },
  footerText: {
    fontSize: 9,
    fontFamily: PDF_FONT_FAMILY,
    color: '#64748b',
  },
  pageNumber: {
    fontSize: 9,
    fontFamily: PDF_FONT_FAMILY,
    color: '#94a3b8',
  },
});

interface PdfPageChromeProps {
  flowTitle: string;
  logoSrc: string;
  showHeader?: boolean;
}

export const PdfPageHeader = ({ flowTitle, showHeader = true }: Pick<PdfPageChromeProps, 'flowTitle' | 'showHeader'>) => {
  if (!showHeader) return null;

  return (
    <View style={chromeStyles.header} fixed>
      <Text style={chromeStyles.headerTitle}>{flowTitle}</Text>
    </View>
  );
};

export const PdfPageFooter = ({ logoSrc }: Pick<PdfPageChromeProps, 'logoSrc'>) => (
  <View style={chromeStyles.footer} fixed>
    <View style={chromeStyles.footerBrand}>
      <Image style={chromeStyles.footerLogo} src={logoSrc} />
      <Text style={chromeStyles.footerText}>{PDF_FOOTER_TAGLINE}</Text>
    </View>
    <Text
      style={chromeStyles.pageNumber}
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
    />
  </View>
);
