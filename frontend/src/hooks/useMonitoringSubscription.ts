import { useEffect } from 'react';
import { useMonitoringStore } from '../store/monitoringStore';
import { runtimeConfig } from '../config/runtimeConfig';

export const useMonitoringSubscription = () => {
  const addEvent = useMonitoringStore(state => state.addEvent);

  useEffect(() => {
    // 1. Setup SSE Connection
    const baseUrl = runtimeConfig.api.baseUrl;
    const url = `${baseUrl}/api/v1/live/stream?token=dev-api-key`;
    console.log(`[MonitoringSub] Connecting to ${url}...`);

    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      try {
        eventSource = new EventSource(url);

        eventSource.onopen = () => {
          console.log("[MonitoringSub] SSE Connected");
        };

        eventSource.onmessage = (e) => {
          try {
            if (e.data === 'heartbeat' || e.data.includes('connected')) return;

            const data = JSON.parse(e.data);
            // data is the { ...event_dict, domain, risk_score } we prepared in live_routes.py

            // Map SSE payload to MonitoringStore event format
            // In live_routes.py we added 'domain' to the root of the dict
            // We also need to ensure 'decision' and 'suggestion' are present if missing
            
            const evt = {
                id: data.event_id,
                domain: data.domain || 'WEB', // Fallback
                timestamp: data.timestamp_epoch ? new Date(data.timestamp_epoch * 1000).toISOString() : new Date().toISOString(),
                ip: data.raw_features?.ip || data.ip || '0.0.0.0',
                route: data.raw_features?.path || data.raw_features?.endpoint || data.route || '/',
                riskScore: data.risk_score || 0,
                decision: data.final_decision || 'ALLOW', 
                suggestion: data.recommendation || 'None',
                payload: data.raw_features || {}
            };
            
            addEvent(evt as any);

          } catch (err) {
            console.error("[MonitoringSub] Parse Error", err);
          }
        };

        eventSource.onerror = (err) => {
          console.error("[MonitoringSub] SSE Error", err);
          eventSource?.close();
          
          reconnectTimeout = setTimeout(() => {
            connect();
          }, 3000); // Simple 3s retry
        };

      } catch (err) {
        console.error("[MonitoringSub] Connection failed", err);
      }
    };

    connect();

    return () => {
      if (eventSource) {
        console.log("[MonitoringSub] Closing connection");
        eventSource.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [addEvent]);
};
