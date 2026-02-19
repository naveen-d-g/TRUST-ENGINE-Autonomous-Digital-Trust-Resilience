/**
 * Chart-specific color schemes
 * Optimized for data visualization in dark theme
 */

export const chartColors = {
  // Primary chart colors (for multiple series)
  series: [
    '#3B82F6', // Blue
    '#22C55E', // Green
    '#F59E0B', // Orange
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#EF4444', // Red
    '#10B981', // Emerald
  ],
  
  // Severity gradient
  severity: {
    critical: '#DC2626',
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#22C55E',
    info: '#3B82F6',
  },
  
  // Risk gradient
  risk: {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#22C55E',
  },
  
  // Decision colors
  decision: {
    allow: '#22C55E',
    block: '#EF4444',
    challenge: '#F59E0B',
    monitor: '#3B82F6',
  },
  
  // Domain colors
  domain: {
    web: '#3B82F6',
    api: '#22C55E',
    network: '#F59E0B',
    infra: '#8B5CF6',
  },
  
  // Heatmap gradient (low to high)
  heatmap: [
    '#1E293B', // Very low
    '#334155', // Low
    '#475569', // Medium-low
    '#64748B', // Medium
    '#94A3B8', // Medium-high
    '#CBD5E1', // High
    '#E2E8F0', // Very high
  ],
  
  // Trust score gradient
  trustScore: {
    excellent: '#22C55E',
    good: '#84CC16',
    fair: '#F59E0B',
    poor: '#EF4444',
    critical: '#DC2626',
  },
  
  // Grid and axis colors
  grid: '#374151',
  axis: '#6B7280',
  
  // Tooltip background
  tooltipBg: '#1F2937',
  tooltipBorder: '#4B5563',
} as const;

/**
 * Get color for severity level
 */
export function getSeverityColor(severity: string): string {
  const normalized = severity.toUpperCase();
  switch (normalized) {
    case 'CRITICAL':
      return chartColors.severity.critical;
    case 'HIGH':
      return chartColors.severity.high;
    case 'MEDIUM':
      return chartColors.severity.medium;
    case 'LOW':
      return chartColors.severity.low;
    default:
      return chartColors.severity.info;
  }
}

/**
 * Get color for risk level
 */
export function getRiskColor(risk: string): string {
  const normalized = risk.toUpperCase();
  switch (normalized) {
    case 'HIGH':
      return chartColors.risk.high;
    case 'MEDIUM':
      return chartColors.risk.medium;
    case 'LOW':
      return chartColors.risk.low;
    default:
      return chartColors.risk.medium;
  }
}

/**
 * Get color for decision type
 */
export function getDecisionColor(decision: string): string {
  const normalized = decision.toUpperCase();
  switch (normalized) {
    case 'ALLOW':
      return chartColors.decision.allow;
    case 'BLOCK':
      return chartColors.decision.block;
    case 'CHALLENGE':
      return chartColors.decision.challenge;
    case 'MONITOR':
      return chartColors.decision.monitor;
    default:
      return chartColors.decision.monitor;
  }
}

/**
 * Get color for trust score (0-100)
 */
export function getTrustScoreColor(score: number): string {
  if (score >= 90) return chartColors.trustScore.excellent;
  if (score >= 70) return chartColors.trustScore.good;
  if (score >= 50) return chartColors.trustScore.fair;
  if (score >= 30) return chartColors.trustScore.poor;
  return chartColors.trustScore.critical;
}
