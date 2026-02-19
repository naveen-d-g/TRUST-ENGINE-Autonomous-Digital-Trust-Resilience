/**
 * Design tokens for Trust Engine SOC Platform
 * Dark cyber aesthetic with neon accents
 */

export const colors = {
  // Background colors
  bgPrimary: '#0B1220',
  bgSecondary: '#111827',
  bgTertiary: '#1F2937',
  bgCard: '#151C2F',
  bgHover: '#1E293B',
  
  // Neon accent colors
  neonBlue: '#3B82F6',
  neonGreen: '#22C55E',
  neonOrange: '#F59E0B',
  neonRed: '#EF4444',
  neonPurple: '#8B5CF6',
  neonCyan: '#06B6D4',
  neonPink: '#EC4899',
  
  // Text colors
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  textDisabled: '#6B7280',
  
  // Border colors
  borderPrimary: '#374151',
  borderSecondary: '#4B5563',
  borderAccent: '#3B82F6',
  
  // Status colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Severity colors
  severityCritical: '#DC2626',
  severityHigh: '#EF4444',
  severityMedium: '#F59E0B',
  severityLow: '#22C55E',
  severityInfo: '#3B82F6',
  
  // Risk colors
  riskHigh: '#EF4444',
  riskMedium: '#F59E0B',
  riskLow: '#22C55E',
  
  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayHeavy: 'rgba(0, 0, 0, 0.7)',
} as const;

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  neon: '0 0 20px rgba(59, 130, 246, 0.5)',
  neonGreen: '0 0 20px rgba(34, 197, 94, 0.5)',
  neonRed: '0 0 20px rgba(239, 68, 68, 0.5)',
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  tooltip: 1400,
  notification: 1500,
} as const;
