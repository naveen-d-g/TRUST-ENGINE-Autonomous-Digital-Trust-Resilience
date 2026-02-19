import { logger } from '../../services/logger';

export function useErrorLogger() {
  const logError = (error: Error, context?: Record<string, unknown>) => {
    logger.error('Component error', error, context);
  };

  return { logError };
}
