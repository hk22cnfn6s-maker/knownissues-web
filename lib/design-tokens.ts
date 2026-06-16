/**
 * Single source of truth for the KnownIssues.co.uk visual identity.
 * Mirrors the CSS variables defined in /styles/globals.css and the
 * Tailwind theme extension in tailwind.config.ts — use this file when
 * you need a token value in plain TypeScript (inline styles, canvas,
 * email templates) rather than as a Tailwind class.
 */

export const colors = {
  background: '#F8F7F5',
  surface: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',
  accent: '#C17F3E',
  accentHover: '#A86A2E',
  border: '#E2E0DC',
  darkSurface: '#1A1A1A',
} as const

export const typography = {
  fontHeading: 'var(--font-playfair)',
  fontBody: 'var(--font-inter)',
  headingLetterSpacing: '-0.02em',
  sizes: {
    h1: '56px',
    h2: '36px',
    h3: '24px',
    h4: '20px',
    body: '16px',
  },
  lineHeight: {
    body: '1.7',
  },
} as const

/** 4px base unit — use multiples of this scale for all spacing. */
export const spacing = {
  unit: 4,
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  '2xl': '64px',
  '3xl': '96px',
} as const

export const designTokens = { colors, typography, spacing } as const
