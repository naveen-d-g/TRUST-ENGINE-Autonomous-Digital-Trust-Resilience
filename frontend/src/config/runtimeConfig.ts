import { env } from './env';

/**
 * Runtime configuration derived from environment variables
 * Provides type-safe access to all configuration values
 */
export const runtimeConfig = {
  api: {
    baseUrl: env.VITE_API_BASE_URL,
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  
  websocket: {
    url: env.VITE_WS_URL,
    reconnectAttempts: 5,
    reconnectDelay: 2000, // 2 seconds
    heartbeatInterval: 30000, // 30 seconds
  },
  
  features: {
    simulation: env.VITE_ENABLE_SIMULATION,
    replay: env.VITE_ENABLE_REPLAY,
    advancedML: env.VITE_ENABLE_ADVANCED_ML,
  },
  
  environment: env.VITE_ENV,
  
  isDevelopment: env.VITE_ENV === 'development',
  isProduction: env.VITE_ENV === 'production',
  isStaging: env.VITE_ENV === 'staging',
  
  logging: {
    level: env.VITE_ENV === 'production' ? 'error' : 'debug',
    sendToBackend: env.VITE_ENV === 'production',
  },
  
  performance: {
    websocketBufferDelay: 300, // ms
    searchDebounceDelay: 500, // ms
    maxReplayBufferSize: 1000, // events
    replayTimeWindow: 3600000, // 1 hour in ms
  },
  
  security: {
    tokenRefreshThreshold: 300000, // 5 minutes before expiry
    autoLogoutDelay: 900000, // 15 minutes of inactivity
  },
} as const;

export type RuntimeConfig = typeof runtimeConfig;

// Validate configuration on module load
if (runtimeConfig.isDevelopment) {
  console.log('🔧 Runtime Configuration:', runtimeConfig);
}
