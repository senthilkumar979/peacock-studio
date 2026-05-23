import { BRAND_COLORS } from '@/constants/branding';

export const PDF_FONT_FAMILY = 'Lexend';

export const PDF_COLORS = {
  primary: BRAND_COLORS.primary,
  instructionBackground: BRAND_COLORS.primaryMutedBg,
  instructionBorder: BRAND_COLORS.primaryMutedBorder,
  instructionLabel: BRAND_COLORS.primaryLabel,
  instructionText: BRAND_COLORS.primaryInstructionText,
  imageBorder: '#64748b',
  imageFrameBackground: '#f8fafc',
} as const;
