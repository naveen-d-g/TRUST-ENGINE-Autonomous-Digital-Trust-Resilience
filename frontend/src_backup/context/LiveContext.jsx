import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';

const LiveContext = createContext();

export const LiveProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
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
      if (!isAuthenticated || isPaused) return;

      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/live/stream?token=dev-api-key`;
      console.log(`Connecting to Live Stream (Attempt ${retryCount + 1})...`);

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

    // Initial Fetch History
    if (isAuthenticated && !isPaused) {
       fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/live/history`, {
        headers: { 'X-API-Key': 'dev-api-key' }
       })
       .then(res => res.json())
       .then(data => {
         if (Array.isArray(data)) setEvents(data.reverse());
       })
       .catch(err => console.error("Failed to load history", err));
       
       connect();
    }

    return () => {
      if (eventSource) {
        console.log("Cleaning up Live Stream");
        eventSource.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      setIsConnected(false);
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
      clearEvents
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
