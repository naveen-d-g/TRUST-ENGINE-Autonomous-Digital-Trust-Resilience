import { useQuery } from '@tanstack/react-query';
import { http } from './http';
import { SocSummaryResponse } from '../types/soc';
import { LiveState } from '../state/liveState';

export const useSocSummary = (): LiveState<SocSummaryResponse> => {
  const { data, status, dataUpdatedAt, error } = useQuery({
    queryKey: ['soc', 'summary'],
    queryFn: async () => {
      // Mock Data (until backend endpoint is ready or accessible)
      // Ideally http.get('/soc/summary')
      // For now, returning mock to satisfy TS and structure
      /*
      return {
        system_status: 'ONLINE',
        last_updated: new Date().toISOString(),
        metrics: {
          active_sessions: 124,
          global_risk_score: 12,
          active_incidents: 3,
          risk_velocity: 0.4
        },
        domain_risk: { web: 10, api: 5, network: 2, infra: 0, system: 0 },
        operator_focus: {
          headline: "Normal Operation",
          bullets: ["Monitor traffic spikes", "Review new logins"]
        }
      } as SocSummaryResponse;
      */
      
      // Real Call (If backend readiness is confirmed, which it is)
      // However, backend might not imply this specific structure yet.
      // I will implement a safe fetcher.
      const res = await http.get<SocSummaryResponse>('/soc/summary'); 
      return res.data;
    },
    refetchInterval: 5000,
  });

  // Transform React Query state to LiveState
  const liveStatus = status === 'pending' ? 'loading' : status === 'error' ? 'error' : 'live';
  
  // Check freshness
  const isStale = Date.now() - dataUpdatedAt > 10000;

  return {
    data: data || null,
    status: isStale && liveStatus === 'live' ? 'stale' : liveStatus,
    lastUpdated: dataUpdatedAt,
    error: error as Error | null
  };
};
