import { UserDTO } from '../../types/dto';
import { UserModel } from '../../types/models';
import { logger } from '../../services/logger';

/**
 * Map User DTO to User Model
 */
export function mapUserDto(dto: UserDTO): UserModel {
  // Runtime validation
  if (!dto.id) {
    throw new Error('Invalid UserDTO: missing id');
  }
  if (!dto.username) {
    throw new Error('Invalid UserDTO: missing username');
  }

  try {
    return {
      id: dto.id,
      username: dto.username,
      email: dto.email || '',
      role: dto.role || 'VIEWER',
      createdAt: new Date(dto.created_at),
      lastLogin: dto.last_login ? new Date(dto.last_login) : undefined,
    };
  } catch (error) {
    logger.error('Failed to map UserDTO', error as Error, { dto });
    throw new Error(`UserDTO mapping failed: ${(error as Error).message}`);
  }
}

/**
 * Map array of User DTOs to User Models
 */
export function mapUserDtoArray(dtos: UserDTO[]): UserModel[] {
  return dtos.map(mapUserDto);
}

/**
 * Validate User DTO shape
 */
export function isValidUserDto(dto: unknown): dto is UserDTO {
  if (!dto || typeof dto !== 'object') return false;
  
  const obj = dto as Record<string, unknown>;
  
  return (
    typeof obj.id === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.role === 'string'
  );
}
