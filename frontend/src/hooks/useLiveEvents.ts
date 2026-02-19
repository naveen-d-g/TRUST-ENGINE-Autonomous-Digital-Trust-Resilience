import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { logger } from '../services/logger';

/**
 * useLiveEvents Hook
 * Uses authenticated polling via API service.
 * WebSocket logic removed as endpoints are REST-based for metrics.
 */
export const useLiveEvents = <T>(endpoint: string, initialData: T, pollInterval: number = 5000) => {
    const [data, setData] = useState<T>(initialData);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            try {
                // Ensure endpoint has /api/v1 prefix if not present
                const url = endpoint.startsWith('/api') ? endpoint : `/api/v1${endpoint}`;
                
                const result = await api.get<T>(url);
                if (isMounted) {
                    setData(result);
                    setIsLive(true);
                }
            } catch (error) {
                logger.error(`[Poll] Error on ${endpoint}`, error as Error);
                if (isMounted) setIsLive(false);
            }
        };

        // Initial fetch
        fetchData();

        const timer = setInterval(fetchData, pollInterval);

        return () => {
            isMounted = false;
            clearInterval(timer);
        };
    }, [endpoint, pollInterval]);

    return { data, isLive };
};
