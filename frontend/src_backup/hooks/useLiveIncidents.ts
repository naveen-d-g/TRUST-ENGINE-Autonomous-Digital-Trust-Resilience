import { useLiveEvents } from './useLiveEvents';
import { IncidentSummary } from '../types/soc';

/**
 * useLiveIncidents Hook
 * Specialized hook for the incident stream.
 */
export const useLiveIncidents = (initialIncidents: IncidentSummary[] = []) => {
    return useLiveEvents<IncidentSummary[]>('/soc/incidents', initialIncidents, 3000);
};
