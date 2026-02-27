import { SessionDTO } from '../../types/dto';
import { SessionModel } from '../../types/models';
import { logger } from '../../services/logger';

/**
 * Map Session DTO to Session Model
 * Enforces strict contract: API → DTO → Mapper → Model → Store → Component
 */
export function mapSessionDto(dto: SessionDTO): SessionModel {
  // Runtime validation - fail fast on invalid data
  if (!dto.session_id) {
    throw new Error('Invalid SessionDTO: missing session_id');
  }
  // Relax user_id requirement for simulated sessions
  const userId = dto.user_id || 'Anonymous';
  if (!dto.timestamp && !dto.created_at) {
    throw new Error('Invalid SessionDTO: missing timestamp or created_at');
  }

  try {
    return {
      id: dto.session_id,
      userId: userId,
      ipAddress: dto.ip_address || 'Unknown',
      timestamp: new Date(dto.timestamp || dto.created_at!),
      riskScore: dto.risk_score ?? 0,
      decision: dto.decision || (dto as any).final_decision || 'MONITOR',
      domain: dto.domain || 'UNKNOWN',
      trustScore: dto.trust_score ?? 100,
      anomalyCount: dto.anomaly_count ?? 0,
      threatLevel: dto.threat_level || 'LOW',
      source: dto.source || 'PROD',
      primaryCause: dto.primary_cause,
      recommendedAction: dto.recommended_action,
      label: (dto.decision === 'BLOCK' || dto.decision === 'TERMINATE' || (dto.risk_score ?? 0) > 80) ? 'ESCALATE' :
             (dto.decision === 'CHALLENGE' || (dto.risk_score ?? 0) > 50) ? 'RESTRICT' : 'ALLOW',
    };
  } catch (error) {
    logger.error('Failed to map SessionDTO', error as Error, { dto });
    throw new Error(`SessionDTO mapping failed: ${(error as Error).message}`);
  }
}

/**
 * Map array of Session DTOs to Session Models
 */
export function mapSessionDtoArray(dtos: SessionDTO[]): SessionModel[] {
  return dtos.map(mapSessionDto);
}

/**
 * Validate Session DTO shape
 */
export function isValidSessionDto(dto: unknown): dto is SessionDTO {
  if (!dto || typeof dto !== 'object') return false;
  
  const obj = dto as Record<string, unknown>;
  
  return (
    typeof obj.session_id === 'string' &&
    (typeof obj.timestamp === 'string' || typeof obj.created_at === 'string') &&
    typeof obj.risk_score === 'number'
  );
}
