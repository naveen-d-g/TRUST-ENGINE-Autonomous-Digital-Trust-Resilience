import { create } from 'zustand';
import { api } from '../services/api';
import { logger } from '../services/logger';
import { IncidentModel } from '../types/models';
import { IncidentDTO } from '../types/dto';
import { mapIncidentDto, mapIncidentDtoArray } from '../core/mappers/incidentMapper';
import { eventBus } from '../services/eventBus';

/**
 * Incident Store - follows standard data contract
 */
interface IncidentState {
  incidents: IncidentModel[];
  selectedIncident: IncidentModel | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Actions
  fetch: () => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;
  addIncident: (incident: IncidentModel) => void;
  updateIncident: (incident: IncidentModel) => void;
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  incidents: [],
  selectedIncident: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetch: async () => {
    if (get().loading) return;

    set({ loading: true, error: null });
    logger.debug('Fetching incidents');

    try {
      const dtos = await api.get<IncidentDTO[]>('/api/incidents');
      const incidents = mapIncidentDtoArray(dtos);

      set({
        incidents,
        loading: false,
        lastFetched: Date.now(),
      });

      logger.info('Incidents fetched successfully', { count: incidents.length });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch incidents';
      logger.error('Failed to fetch incidents', error as Error);
      
      set({
        loading: false,
        error: errorMessage,
      });
    }
  },

  fetchById: async (id: string) => {
    set({ loading: true, error: null });
    logger.debug('Fetching incident by ID', { id });

    try {
      const dto = await api.get<IncidentDTO>(`/api/incidents/${id}`);
      const incident = mapIncidentDto(dto);

      set({
        selectedIncident: incident,
        loading: false,
      });

      logger.info('Incident fetched successfully', { id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch incident';
      logger.error('Failed to fetch incident', error as Error, { id });
      
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
      incidents: [],
      selectedIncident: null,
      loading: false,
      error: null,
      lastFetched: null,
    });
  },

  addIncident: (incident: IncidentModel) => {
    set((state) => ({
      incidents: [incident, ...state.incidents],
    }));
  },

  updateIncident: (incident: IncidentModel) => {
    set((state) => ({
      incidents: state.incidents.map((i) => (i.id === incident.id ? incident : i)),
      selectedIncident: state.selectedIncident?.id === incident.id ? incident : state.selectedIncident,
    }));
  },
}));

// Subscribe to realtime incident updates
eventBus.on('incident:new', (data) => {
  try {
    const incident = mapIncidentDto(data as IncidentDTO);
    useIncidentStore.getState().addIncident(incident);
    logger.info('New incident added via realtime', { incidentId: incident.id });
  } catch (error) {
    logger.error('Failed to add realtime incident', error as Error);
  }
});

eventBus.on('incident:updated', (data) => {
  try {
    const incident = mapIncidentDto(data as IncidentDTO);
    useIncidentStore.getState().updateIncident(incident);
    logger.debug('Incident updated via realtime', { incidentId: incident.id });
  } catch (error) {
    logger.error('Failed to update realtime incident', error as Error);
  }
});
