/**
 * Centralized layout + visual tokens.
 *
 * This is intentionally NOT a rebrand: the colors mirror what screens already
 * used (#2d6cdf primary, #c0392b error, etc.). The point is to stop spacing,
 * radii, and palette values from drifting per-file so layouts share one rhythm.
 */

export const colors = {
  primary: '#2d6cdf',
  primaryPressed: '#225bc0',

  text: '#111111',
  textSecondary: '#555555',
  textMuted: '#888888',

  surface: '#ffffff',
  surfaceMuted: '#f7f8fa',

  border: '#e3e3e3',
  borderStrong: '#cccccc',
  hairline: '#eeeeee',

  error: '#c0392b',
  errorSurface: '#fdecea',
  success: '#1e7e34',
  warning: '#b9770e',

  accentSurface: '#f3f7ff',
  accentBorder: '#d6e0f5',

  onPrimary: '#ffffff',
} as const;

/** 4-pt spacing scale. Use these instead of raw numbers. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Standard insets for the edge of a screen's content. */
export const screen = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const },
  heading: { fontSize: 22, fontWeight: '700' as const },
  sectionTitle: { fontSize: 17, fontWeight: '600' as const },
  /** Small uppercase eyebrow used to label groups in lists. */
  label: {
    fontSize: 13,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: colors.textMuted,
  },
  body: { fontSize: 16, fontWeight: '400' as const },
  secondary: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;
