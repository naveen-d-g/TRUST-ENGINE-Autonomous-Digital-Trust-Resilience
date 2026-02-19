import { z } from 'zod';

/**
 * Environment variable schema with strict validation
 * Ensures all required config is present at runtime
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url('Invalid API base URL'),
  VITE_WS_URL: z.string().url('Invalid WebSocket URL'),
  VITE_ENV: z.enum(['development', 'staging', 'production']),
  VITE_ENABLE_SIMULATION: z.string().transform(val => val === 'true'),
  VITE_ENABLE_REPLAY: z.string().transform(val => val === 'true'),
  VITE_ENABLE_ADVANCED_ML: z.string().transform(val => val === 'true'),
});

/**
 * Validated environment variables
 * Fails fast on missing or invalid configuration
 */
function validateEnv() {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    throw new Error(
      'Invalid environment configuration. Check your .env file and ensure all required variables are set correctly.'
    );
  }
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
