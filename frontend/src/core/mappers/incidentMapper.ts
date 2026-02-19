import { IncidentDTO } from '../../types/dto';
import { IncidentModel } from '../../types/models';
import { logger } from '../../services/logger';

/**
 * Map Incident DTO to Incident Model
 */
export function mapIncidentDto(dto: IncidentDTO): IncidentModel {
  // Runtime validation
  if (!dto.id) {
    throw new Error('Invalid IncidentDTO: missing id');
  }
  if (!dto.session_id) {
    throw new Error('Invalid IncidentDTO: missing session_id');
  }
  if (!dto.created_at) {
    throw new Error('Invalid IncidentDTO: missing created_at');
  }

  try {
    return {
      id: dto.id,
      sessionId: dto.session_id,
      severity: dto.severity || 'LOW',
      status: dto.status || 'OPEN',
      title: dto.title || 'Untitled Incident',
      description: dto.description || '',
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at || dto.created_at),
      assignedTo: dto.assigned_to,
      resolution: dto.resolution,
    };
  } catch (error) {
    logger.error('Failed to map IncidentDTO', error as Error, { dto });
    throw new Error(`IncidentDTO mapping failed: ${(error as Error).message}`);
  }
}

/**
 * Map array of Incident DTOs to Incident Models
 */
export function mapIncidentDtoArray(dtos: IncidentDTO[]): IncidentModel[] {
  return dtos.map(mapIncidentDto);
}

/**
 * Validate Incident DTO shape
 */
export function isValidIncidentDto(dto: unknown): dto is IncidentDTO {
  if (!dto || typeof dto !== 'object') return false;
  
  const obj = dto as Record<string, unknown>;
  
  return (
    typeof obj.id === 'string' &&
    typeof obj.session_id === 'string' &&
    typeof obj.severity === 'string' &&
    typeof obj.status === 'string'
  );
}
