/**
 * SOC Design Tokens
 * Centralized source of truth for colors, spacing, and branding.
 */

export const Tokens = {
  colors: {
    // Brand
    primary: '#3b82f6', // Bright Blue
    secondary: '#6366f1', // Indigo
    background: '#020617', // Slate 950
    card: '#0f172a', // Slate 900
    muted: '#1e293b', // Slate 800
    border: '#334155', // Slate 700
    foreground: '#f8fafc', // Slate 50

    // Severity
    severity: {
      low: '#22c55e',      // Green-500
      medium: '#eab308',   // Yellow-500
      high: '#f97316',     // Orange-500
      critical: '#ef4444', // Red-500
    },

    // Action States
    monitor: '#3b82f6',    // Blue-500
    restrict: '#a855f7',   // Purple-500
    escalate: '#ec4899',   // Pink-500
    success: '#10b981',    // Emerald-500
    error: '#f43f5e',      // Rose-500
  },

  glows: {
    low: '0 0 15px rgba(34, 197, 94, 0.3)',
    medium: '0 0 20px rgba(234, 179, 8, 0.4)',
    high: '0 0 25px rgba(249, 115, 22, 0.5)',
    critical: '0 0 35px rgba(239, 68, 68, 0.6)',
  },

  fonts: {
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    sans: 'Inter, system-ui, -apple-system, sans-serif',
  }
};
