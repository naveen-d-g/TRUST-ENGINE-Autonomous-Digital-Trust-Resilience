
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { liveSocket } from '../services/liveSocket';
import { IncidentDetailResponse } from '../types/soc';

export const useLiveIncidentStream = (incidentId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!incidentId) return;

    // Connect if not already
    liveSocket.connect();

    const handleUpdate = (data: IncidentDetailResponse) => {
      if (data.incident_id === incidentId) {
        // Optimistically update the cache
        queryClient.setQueryData(['soc', 'incidents', incidentId], data);
      }
    };

    // Subscribe
    const unsubscribe = liveSocket.on('INCIDENT_UPDATED', handleUpdate);

    return () => {
      unsubscribe();
    };
  }, [incidentId, queryClient]);
};
