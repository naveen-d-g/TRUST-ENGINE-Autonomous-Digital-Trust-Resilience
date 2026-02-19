import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '@/services/api';

/**
 * TelemetryTracker is a headless component that listens for URL changes
 * and reports them as "NAVIGATION" events to the backend ingestion service.
 */
export const TelemetryTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const reportNavigation = async () => {
      // Don't log the telemetry report itself if it were an HTTP call we intercepted,
      // but here we are manually sending a "navigation" event.
      try {
        await api.post('/api/v1/live/ingest/http', {
          method: 'NAVIGATE',
          path: location.pathname + location.search,
          status_code: 200, // Client side navigations are assumed successful
          session_id: localStorage.getItem('session_id') || undefined,
          user_agent: navigator.userAgent,
          ip_address: 'client-side',
        });
      } catch (error) {
        // Silent fail for telemetry
        console.warn('Navigation telemetry failed', error);
      }
    };

    reportNavigation();
  }, [location]);

  return null;
};
