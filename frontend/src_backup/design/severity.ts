import { Tokens } from './tokens';

/**
 * Visual Escalation Matrix
 * Defines how the UI should behave based on backend severity or action states.
 */

export enum SeverityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export const EscalationMatrix = {
  [SeverityLevel.LOW]: {
    color: Tokens.colors.severity.low,
    glow: Tokens.glows.low,
    pulseSpeed: 4, // seconds
    intensity: 0.05,
    animation: 'subtle-drift'
  },
  [SeverityLevel.MEDIUM]: {
    color: Tokens.colors.severity.medium,
    glow: Tokens.glows.medium,
    pulseSpeed: 2.5,
    intensity: 0.1,
    animation: 'pulse-slow'
  },
  [SeverityLevel.HIGH]: {
    color: Tokens.colors.severity.high,
    glow: Tokens.glows.high,
    pulseSpeed: 1.2,
    intensity: 0.2,
    animation: 'pulse-fast'
  },
  [SeverityLevel.CRITICAL]: {
    color: Tokens.colors.severity.critical,
    glow: Tokens.glows.critical,
    pulseSpeed: 0.6,

    intensity: 0.5,
    animation: 'glitch-pulse'
  }
};

export const DecisionVisuals = {
  MONITOR: {
    color: Tokens.colors.monitor,
    icon: 'Activity',
    glow: '0 0 10px rgba(59, 130, 246, 0.4)'
  },
  RESTRICT: {
    color: Tokens.colors.restrict,
    icon: 'ShieldOff',
    glow: '0 0 15px rgba(168, 85, 247, 0.5)'
  },
  ESCALATE: {
    color: Tokens.colors.escalate,
    icon: 'Zap',
    glow: '0 0 20px rgba(236, 72, 153, 0.6)'
  }
};
