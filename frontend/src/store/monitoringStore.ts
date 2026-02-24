import { create } from 'zustand';


export interface MonitoringEvent {
  id: string;
  domain: 'WEB' | 'API' | 'NETWORK' | 'SYSTEM';
  timestamp: string;
  ip: string;
  route?: string;
  riskScore: number;
  decision: 'ALLOW' | 'RESTRICT' | 'ESCALATE';
  suggestion?: string;
  payload?: any;
  type?: string;
}

interface DomainState {
  events: MonitoringEvent[];
  metrics: {
    total: number;
    escalated: number;
    riskAvg: number;
    suspicious: number;
  };
  trend: { time: string; value: number }[];
}

interface MonitoringStore {
  web: DomainState;
  api: DomainState;
  network: DomainState;
  system: DomainState;
  
  addEvent: (event: MonitoringEvent) => void;
  reset: () => void;
}

const initialDomainState: DomainState = {
  events: [],
  metrics: { total: 0, escalated: 0, riskAvg: 0, suspicious: 0 },
  trend: []
};

export const useMonitoringStore = create<MonitoringStore>((set) => ({
  web: { ...initialDomainState },
  api: { ...initialDomainState },
  network: { ...initialDomainState },
  system: { ...initialDomainState },

  addEvent: (event) => set((state) => {
    let domainKey = (event.domain || 'WEB').toLowerCase() as keyof Omit<MonitoringStore, 'addEvent' | 'reset'>;
    
    // Fallback to 'web' if the domain is not one of the pre-defined states to prevent crash
    if (!state[domainKey]) {
        domainKey = 'web';
    }

    const currentDomain = state[domainKey];
    if (!currentDomain) return state; // Hard safety net
    
    // Update Metrics safely
    const m = currentDomain.metrics || { total: 0, escalated: 0, riskAvg: 0, suspicious: 0 };
    const total = m.total + 1;
    const escalated = event.decision === 'ESCALATE' ? m.escalated + 1 : m.escalated;
    const suspicious = event.decision === 'RESTRICT' ? m.suspicious + 1 : m.suspicious;
    
    // Clamp Risk Score to prevent 9890% bugs
    const safeRiskScore = Math.min(100, Math.max(0, Number(event.riskScore) || 0));
    const riskAvg = ((m.riskAvg * m.total) + safeRiskScore) / total;

    // Update Trend (Rolling 60 points window)
    const currentTrend = currentDomain.trend || [];
    const newTrend = [...currentTrend, { time: new Date().toLocaleTimeString(), value: safeRiskScore }];
    if (newTrend.length > 60) newTrend.shift();

    // Update Events (Keep last 50)
    const currentEvents = currentDomain.events || [];
    
    // Add safeRiskScore to the event object
    const safeEvent = { ...event, riskScore: safeRiskScore };
    const newEvents = [safeEvent, ...currentEvents].slice(0, 50);

    return {
      [domainKey]: {
        events: newEvents,
        metrics: { total, escalated, suspicious, riskAvg },
        trend: newTrend
      }
    };
  }),

  reset: () => set({
    web: { ...initialDomainState },
    api: { ...initialDomainState },
    network: { ...initialDomainState },
    system: { ...initialDomainState }
  })
}));
