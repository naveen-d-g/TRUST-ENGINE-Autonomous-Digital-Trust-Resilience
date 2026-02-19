import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { systemService, metricsService } from '../services/api';
import { useAuth } from '../auth/AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const [systemHealth, setSystemHealth] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const pollingInterval = useRef(null);

  const fetchGlobalData = useCallback(async (isInitial = false) => {
    if (!isAuthenticated) return;
    try {
      if (isInitial) setLoading(true);
      const [health, stats] = await Promise.all([
        systemService.health(),
        metricsService.getSummary()
      ]);
      setSystemHealth(health);
      setSummary(stats);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Data Fetch Error:', err);
      if (err.response?.status === 401) {
        logout();
      } else {
        setError(typeof err === 'string' ? err : 'Failed to connect to backend engine');
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [isAuthenticated, logout]);

  // Adaptive Polling Logic
  useEffect(() => {
    if (!isAuthenticated) return;

    const startPolling = () => {
      if (pollingInterval.current) return;
      
      pollingInterval.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchGlobalData(false);
        }
      }, 15000);
    };

    const stopPolling = () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startPolling();
        fetchGlobalData(false);
      } else {
        stopPolling();
      }
    };

    // Initial load
    fetchGlobalData(true);
    startPolling();

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchGlobalData, isAuthenticated]);

  // Batch State Management
  const [batchFile, setBatchFile] = useState(null);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [batchError, setBatchError] = useState(null);

  return (
    <AppContext.Provider value={{
      systemHealth,
      summary,
      loading,
      error,
      lastUpdated,
      refreshData: () => fetchGlobalData(true),
      
      // Batch Accessors
      batchFile, setBatchFile,
      isBatchLoading, setIsBatchLoading,
      batchResult, setBatchResult,
      batchError, setBatchError
    }}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
