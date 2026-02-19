import { create } from 'zustand';
import { api } from '../services/api';
import { logger } from '../services/logger';
import { DashboardMetrics } from '../types/models';
import { DashboardMetricsDTO } from '../types/dto';
import { mapDashboardMetricsDto } from '../core/mappers/dashboardMapper';

/**
 * Standard store data contract
 */
interface DashboardState {
  data: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Actions
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;
  applyRealtimeUpdate: (update: Partial<DashboardMetrics>) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetch: async () => {
    // Don't fetch if already loading
    if (get().loading) return;

    set({ loading: true, error: null });
    logger.debug('Fetching dashboard metrics');

    try {
      const dto = await api.get<DashboardMetricsDTO>('/api/v1/dashboard/metrics');
      const data = mapDashboardMetricsDto(dto);

      set({
        data,
        loading: false,
        lastFetched: Date.now(),
      });

      logger.info('Dashboard metrics fetched successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard';
      logger.error('Failed to fetch dashboard metrics', error as Error);
      
      set({
        loading: false,
        error: errorMessage,
      });
    }
  },

  refresh: async () => {
    // Force refresh even if loading
    set({ loading: true, error: null });
    await get().fetch();
  },

  clear: () => {
    set({
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    });
  },

  applyRealtimeUpdate: (update: Partial<DashboardMetrics>) => {
    const currentData = get().data;
    if (!currentData) return;

    set({
      data: {
        ...currentData,
        ...update,
      },
    });

    logger.debug('Applied realtime update to dashboard', { update });
  },
}));

// Subscribe to realtime metric updates
import { eventBus } from '../services/eventBus';
eventBus.on('metric:updated', (data) => {
  // Apply incremental updates without full refetch
  logger.debug('Received metric update', data);
  // Can be extended to update specific metrics
});
