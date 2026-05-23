import { Font } from '@react-pdf/renderer';
import lexendBold from '@fontsource/lexend/files/lexend-latin-700-normal.woff?url';
import lexendRegular from '@fontsource/lexend/files/lexend-latin-400-normal.woff?url';
import lexendSemiBold from '@fontsource/lexend/files/lexend-latin-600-normal.woff?url';
import { PDF_FONT_FAMILY } from './pdfTheme';

let isRegistered = false;

export function registerPdfFonts(): void {
  if (isRegistered) return;

  Font.register({
    family: PDF_FONT_FAMILY,
    fonts: [
      { src: lexendRegular, fontWeight: 400 },
      { src: lexendSemiBold, fontWeight: 600 },
      { src: lexendBold, fontWeight: 700 },
    ],
  });

  isRegistered = true;
}
