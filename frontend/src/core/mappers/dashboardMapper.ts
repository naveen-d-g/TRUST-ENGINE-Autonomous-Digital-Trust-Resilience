import { DashboardMetricsDTO } from '../../types/dto';
import { DashboardMetrics } from '../../types/models';
import { logger } from '../../services/logger';

/**
 * Map Dashboard Metrics DTO to Dashboard Metrics Model
 */
export function mapDashboardMetricsDto(dto: DashboardMetricsDTO): DashboardMetrics {
  // Runtime validation
  if (typeof dto.total_sessions !== 'number') {
    throw new Error('Invalid DashboardMetricsDTO: missing or invalid total_sessions');
  }

  try {
    return {
      totalSessions: dto.total_sessions,
      activeSessions: dto.active_sessions ?? 0,
      activeIncidents: dto.active_incidents ?? 0,
      criticalIncidents: dto.critical_incidents ?? 0,
      avgRiskScore: dto.avg_risk_score ?? 0,
      blockedSessions: dto.blocked_sessions ?? 0,
      globalTrustScore: dto.global_trust_score ?? 0,
      attackRatio: dto.attack_ratio ?? 0,
      sessionsByDecision: dto.sessions_by_decision || {},
      sessionsBySeverity: dto.sessions_by_severity || {},
      decisionDistribution: dto.decision_distribution || {
        trusted: 0,
        suspicious: 0,
        malicious: 0,
      },
      domainRisk: dto.domain_risk || {
        web: 0,
        api: 0,
        network: 0,
        infra: 0,
      },
      domainRecommendations: dto.domain_recommendations || {
        web: undefined,
        api: undefined,
        network: undefined,
        infra: undefined,
      },
      riskVelocity: (dto.risk_velocity || []).map(item => ({
        timestamp: new Date(item.timestamp),
        value: item.value,
      })),
      timelineData: (dto.timeline_data || []).map(item => ({
        timestamp: new Date(item.timestamp),
        count: item.count,
      })),
      detectionSensitivity: dto.detection_sensitivity || 'Normal',
      primaryRiskVectors: dto.primary_risk_vectors || [],
    };
  } catch (error) {
    logger.error('Failed to map DashboardMetricsDTO', error as Error, { dto });
    throw new Error(`DashboardMetricsDTO mapping failed: ${(error as Error).message}`);
  }
}

/**
 * Validate Dashboard Metrics DTO shape
 */
export function isValidDashboardMetricsDto(dto: unknown): dto is DashboardMetricsDTO {
  if (!dto || typeof dto !== 'object') return false;
  
  const obj = dto as Record<string, unknown>;
  
  return typeof obj.total_sessions === 'number';
}
