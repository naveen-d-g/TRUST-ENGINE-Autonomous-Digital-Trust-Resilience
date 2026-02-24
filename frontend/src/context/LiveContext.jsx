import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useMonitoringStore } from '../store/monitoringStore';
import { api } from '../services/api';
import { runtimeConfig } from '../config/runtimeConfig';
import { eventBus } from '../services/eventBus';

const LiveContext = createContext();

export const LiveProvider = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const addEvent = useMonitoringStore(s => s.addEvent);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ active_sessions: 0 });
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let eventSource;
    let reconnectTimeout;
    let retryCount = 0;
    const MAX_RETRIES = 5;

    const connect = () => {
      // Use runtimeConfig for consistency
      const baseUrl = runtimeConfig.api.baseUrl;
      console.log(`[LiveContext] BaseURL: ${baseUrl}`);
      const url = `${baseUrl}/api/v1/live/stream?token=dev-api-key`;
      
      console.log(`[SSE] Connecting to ${url} (Attempt ${retryCount + 1})...`);

      try {
        eventSource = new EventSource(url);

        eventSource.onopen = () => {
          setError(null);
          setIsConnected(true);
          retryCount = 0; // Reset retries on success
          console.log("Live Stream Connected");
        };

        eventSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === 'connected') {
              setStats(prev => ({ ...prev, active_sessions: data.active_sessions || 0 }));
            } else if (data === 'heartbeat') {
               // Keep-alive
            } else {
              setEvents(prev => [data, ...prev].slice(0, 500));

              // Dispatch to Monitoring Store for Domain Dashboards
              // We do this here to avoid valid duplicate SSE connections
              const monitorEvt = {
                  id: data.event_id,
                  domain: data.domain || 'WEB',
                  timestamp: data.timestamp_epoch ? new Date(data.timestamp_epoch * 1000).toISOString() : new Date().toISOString(),
                  ip: data.raw_features?.ip || data.ip || '0.0.0.0',
                  route: data.raw_features?.path || data.raw_features?.endpoint || data.raw_features?.payload?.route || data.route || '/',
                  riskScore: data.risk_score || data.raw_features?.risk_score || data.raw_features?.payload?.risk_score || 0,
                  decision: (data.final_decision || data.raw_features?.final_decision || data.raw_features?.payload?.final_decision) && 
                            (data.final_decision || data.raw_features?.final_decision || data.raw_features?.payload?.final_decision) !== 'ALLOW' 
                      ? (data.final_decision || data.raw_features?.final_decision || data.raw_features?.payload?.final_decision)
                      : (data.risk_score > 85 ? 'ESCALATE' : data.risk_score > 50 ? 'RESTRICT' : 'ALLOW'),
                  suggestion: data.recommendation || 'None',
                  payload: data.raw_features || {},
                  type: data.event_type || 'unknown' // Ensure type is present
              };
              addEvent(monitorEvt);
              
              // Trigger Global Notification Toast
              if (monitorEvt.decision === 'ESCALATE' || monitorEvt.decision === 'RESTRICT' || monitorEvt.riskScore >= 70) {
                  const userStr = data.actor_id && data.actor_id !== 'anonymous' ? data.actor_id : 'Unknown';
                  const sessionStr = data.session_id ? data.session_id.substring(0, 8) : 'Unknown';
                  eventBus.emit('notification', {
                      message: `Critical Threat: ${monitorEvt.domain} attack from ${monitorEvt.ip} (User: ${userStr} | Session: ${sessionStr})`,
                      severity: monitorEvt.decision === 'RESTRICT' ? 'error' : 'warning'
                  });
              }
              
              if (data.event_type === 'auth' && data.raw_features?.status === 'failed') {
                setAlert({
                  type: 'CRITICAL',
                  message: `High Probability of Account Takeover (Session ${data.session_id ? data.session_id.substring(0,8) : 'UNK'}...)`,
                  timer: '15s'
                });
                setTimeout(() => setAlert(null), 10000);
              }
            }
          } catch (err) {
            console.error("LiveContext Parse Error", err);
          }
        };

        eventSource.onerror = (err) => {
          console.error("LiveContext SSE Error", err);
          eventSource.close();
          setIsConnected(false);
          
          if (retryCount < MAX_RETRIES) {
            const timeout = Math.min(1000 * (2 ** retryCount), 10000); // Exp backoff: 1s, 2s, 4s, 8s, 10s
            setError(`Stream disconnected. Reconnecting in ${timeout/1000}s...`);
            reconnectTimeout = setTimeout(() => {
                retryCount++;
                connect();
            }, timeout);
          } else {
            setError("Connection lost. Please refresh.");
          }
        };

      } catch (err) {
        setError("Connection failed");
        setIsConnected(false);
      }
    };



    // Initial Fetch History using API Service
    if (!isPaused) {
       console.log("[LiveContext] Fetching history...");
       api.get('/api/v1/live/history')
        .then(data => {
            console.log(`[LiveContext] History loaded: ${Array.isArray(data) ? data.length : 0} items`);
            if (Array.isArray(data)) setEvents([...data].reverse());
            setError(null);
        })
        .catch(err => {
            console.error("[LiveContext] History failed", err);
            // More descriptive error
            const msg = err.response?.data?.error || err.message || "Failed to load history";
            setError(`History: ${msg}`);
        });
       
       connect();
    }

    return () => {
      if (eventSource) {
        console.log("Cleaning up Live Stream");
        eventSource.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [isAuthenticated, isPaused]);

  // Actions
  const clearEvents = useCallback(() => setEvents([]), []);
  const togglePause = useCallback(() => setIsPaused(prev => !prev), []);

  return (
    <LiveContext.Provider value={{
      events,
      stats,
      alert,
      error,
      isConnected,
      isPaused,
      togglePause,
      clearEvents,
      reconnect: () => {
          setError("Manual reconnecting...");
          setEvents([]);
          // Toggle isPaused or similar could trigger useEffect, 
          // but let's just use window.location.reload for now as a hammer
          window.location.reload();
      }
    }}>
      {children}
    </LiveContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLiveContext = () => {
  const context = useContext(LiveContext);
  if (!context) throw new Error('useLiveContext must be used within a LiveProvider');
  return context;
};
