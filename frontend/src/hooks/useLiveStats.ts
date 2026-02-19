import { useLiveEvents } from './useLiveEvents';
import { SocStats } from '@/api/soc.api';

/**
 * useLiveStats Hook
 * Specialized hook for the SOC Summary / KPIs.
 */
export const useLiveStats = (initialStats?: SocStats) => {
    return useLiveEvents<SocStats | null>('/metrics/summary', initialStats || null, 5000);
};
