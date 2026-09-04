/**
 * CECUREUS — Design System & Theme Tokens
 *
 * Faithfully extracted from Figma prototype:
 * - Brand Teal / Cyan: #00A99D (Primary accent, CTA, Ally brand)
 * - Dark Teal: #008B80
 * - Light Teal / Mint: #E6F7F5
 * - Slate / Navy: #1E293B (Headings, primary typography)
 * - Soft Gray: #64748B (Subtitles, body copy)
 * - Danger / Emergency: #EF4444 / #FEE2E2
 * - Warning / Amber: #F59E0B / #FEF3C7
 * - Purple / Indigo: #8B5CF6 / #EDE9FE
 */

export const colors = {
  // Brand Primary
  primary: '#00A99D',
  primaryDark: '#008B80',
  primaryLight: '#33BAB0',
  primaryMuted: '#E6F7F5',
  primaryBackground: '#F0FAF9',

  // Secondary Accents
  secondary: '#F59E0B',
  secondaryMuted: '#FEF3C7',
  accentPurple: '#8B5CF6',
  accentPurpleMuted: '#EDE9FE',
  accentBlue: '#3B82F6',
  accentBlueMuted: '#DBEAFE',
  accentGreen: '#10B981',
  accentGreenMuted: '#D1FAE5',

  // Neutral / Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceElevated: '#FFFFFF',

  // Typography / Text
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#00A99D',

  // Emergency / SOS
  emergencyBackground: '#FFF1F2',
  emergencyBorder: '#FFE4E6',
  emergencyText: '#E11D48',
  emergencyPhone: '#DC2626',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  online: '#22C55E',

  // Overlays
  overlay: 'rgba(15, 23, 42, 0.5)',
};

export const typography = {
  h1: {
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 34,
    color: colors.text,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    color: colors.text,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: colors.text,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: colors.text,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    color: colors.textMuted,
  },
  captionBold: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  small: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
    color: colors.textMuted,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};
