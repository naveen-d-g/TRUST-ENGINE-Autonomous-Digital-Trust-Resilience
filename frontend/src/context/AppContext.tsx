import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { systemService, metricsService } from '../services/api';
import { useAuth } from '../auth/AuthContext';

// Define types for the context state
interface SystemHealth {
  [key: string]: any;
}

interface SummaryStats {
  [key: string]: any;
}

export interface AppContextType {
  systemHealth: SystemHealth | null;
  summary: SummaryStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
  
  // Batch State
  batchFile: File | null;
  setBatchFile: (file: File | null) => void;
  isBatchLoading: boolean;
  setIsBatchLoading: (loading: boolean) => void;
  batchResult: any;
  setBatchResult: (result: any) => void;
  batchError: any;
  setBatchError: (error: any) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

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
    } catch (err: any) {
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
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<any>(null);
  const [batchError, setBatchError] = useState<any>(null);

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
