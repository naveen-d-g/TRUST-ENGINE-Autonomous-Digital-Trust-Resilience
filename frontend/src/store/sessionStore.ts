import { create } from 'zustand';
import { api } from '../services/api';
import { logger } from '../services/logger';
import { SessionModel } from '../types/models';
import { SessionDTO } from '../types/dto';
import { mapSessionDto, mapSessionDtoArray } from '../core/mappers/sessionMapper';
import { eventBus } from '../services/eventBus';

/**
 * Session Store - follows standard data contract
 */
interface SessionState {
  sessions: SessionModel[];
  selectedSession: SessionModel | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Filters
  filters: {
    decision?: string;
    severity?: string;
    search?: string;
    source?: string;
  };
  
  // Actions
  fetch: (filters?: SessionState['filters']) => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  loadBatchResults: (batchId: string) => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;
  setFilters: (filters: SessionState['filters']) => void;
  updateSession: (session: SessionModel) => void;
  getSessionLogs: (sessionId: string) => Promise<any[]>;
  terminateSession: (sessionId: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  selectedSession: null,
  loading: false,
  error: null,
  lastFetched: null,
  filters: {},

  fetch: async (filters) => {
    if (get().loading) return;

    set({ loading: true, error: null });
    if (filters) {
      set({ filters });
    }

    logger.debug('Fetching sessions', { filters: get().filters });

    try {
      const params = new URLSearchParams();
      const currentFilters = get().filters;
      
      if (currentFilters.decision) params.append('decision', currentFilters.decision);
      if (currentFilters.severity) params.append('severity', currentFilters.severity);
      if (currentFilters.search) params.append('search', currentFilters.search);

      const dtos = await api.get<SessionDTO[]>(`/api/v1/sessions?${params.toString()}`);
      const sessions = mapSessionDtoArray(dtos);

      set({
        sessions,
        loading: false,
        lastFetched: Date.now(),
      });

      logger.info('Sessions fetched successfully', { count: sessions.length });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sessions';
      logger.error('Failed to fetch sessions', error as Error);
      
      set({
        loading: false,
        error: errorMessage,
      });
    }
  },

  fetchById: async (id: string) => {
    set({ loading: true, error: null });
    logger.debug('Fetching session by ID', { id });

    try {
      const dto = await api.get<SessionDTO>(`/api/v1/sessions/${id}`);
      const session = mapSessionDto(dto);

      set({
        selectedSession: session,
        loading: false,
      });

      logger.info('Session fetched successfully', { id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch session';
      logger.error('Failed to fetch session', error as Error, { id });
      
      set({
        loading: false,
        error: errorMessage,
      });
    }
  },

  loadBatchResults: async (batchId: string) => {
    set({ loading: true, error: null });
    logger.debug('Loading batch results into store', { batchId });

    try {
      const dtos = await api.get<SessionDTO[]>(`/api/v1/batch/${batchId}/results`);
      const sessions = mapSessionDtoArray(dtos);

      set({
        sessions, // Replace or append? Usually Batch Page wants to show JUST the results.
        loading: false,
      });

      logger.info('Batch results loaded successfully', { count: sessions.length });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load batch results';
      logger.error('Failed to load batch results', error as Error, { batchId });
      
      set({
        loading: false,
        error: errorMessage,
      });
    }
  },

  refresh: async () => {
    await get().fetch();
  },

  clear: () => {
    set({
      sessions: [],
      selectedSession: null,
      loading: false,
      error: null,
      lastFetched: null,
    });
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetch();
  },

  updateSession: (session: SessionModel) => {
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === session.id ? session : s)),
      selectedSession: state.selectedSession?.id === session.id ? session : state.selectedSession,
    }));
  },
  getSessionLogs: async (sessionId: string) => {
    try {
      const logs = await api.get<any[]>(`/api/soc/sessions/${sessionId}/logs`);
      return logs;
    } catch (error) {
      logger.error('Failed to fetch session logs', error as Error, { sessionId });
      return [];
    }
  },

  terminateSession: async (sessionId: string) => {
    try {
      await api.post(`/api/soc/sessions/${sessionId}/terminate`, {});
      
      // Optimistic update
      const { sessions, selectedSession } = get();
      const updater = (s: SessionModel) => s.id === sessionId ? { ...s, decision: 'TERMINATE', riskScore: 0 } : s;

      set({
        sessions: sessions.map(updater),
        selectedSession: selectedSession?.id === sessionId ? updater(selectedSession) : selectedSession
      });

      logger.info('Session terminated successfully', { sessionId });
    } catch (error) {
      logger.error('Failed to terminate session', error as Error, { sessionId });
      throw error;
    }
  },
}));

// Subscribe to realtime session updates
eventBus.on('session:updated', (data) => {
  try {
    const session = mapSessionDto(data as unknown as SessionDTO);
    useSessionStore.getState().updateSession(session);
    logger.debug('Applied realtime session update', { sessionId: session.id });
  } catch (error) {
    logger.error('Failed to apply realtime session update', error as Error);
  }
});
