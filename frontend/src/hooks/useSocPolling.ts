import { useQuery } from '@tanstack/react-query';
import { socApi } from '../api/soc.api';
import { incidentApi } from '../api/incident.api';
import { enforcementApi } from '../api/enforcement.api';

// Polling Intervals
const ACTIVE_POLL_INTERVAL = 5000; // 5 seconds

export const useSocPolling = () => {
  // 1. Dashboard Stats
  const statsQuery = useQuery({
    queryKey: ['soc', 'stats'],
    queryFn: socApi.getStats,
    refetchInterval: ACTIVE_POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });

  // 2. Active Incidents (Stream)
  const incidentsQuery = useQuery({
    queryKey: ['soc', 'incidents'],
    queryFn: incidentApi.getAll,
    refetchInterval: ACTIVE_POLL_INTERVAL,
  });

  // 3. Pending Proposals (Stream)
  const proposalsQuery = useQuery({
    queryKey: ['soc', 'proposals'],
    queryFn: enforcementApi.getAll,
    refetchInterval: ACTIVE_POLL_INTERVAL,
  });

  return {
    stats: statsQuery.data,
    incidents: incidentsQuery.data || [],
    proposals: proposalsQuery.data || [],
    isLoading: statsQuery.isLoading || incidentsQuery.isLoading || proposalsQuery.isLoading,
    isError: statsQuery.isError || incidentsQuery.isError || proposalsQuery.isError,
  };
};
