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
    const domainKey = event.domain.toLowerCase() as keyof Omit<MonitoringStore, 'addEvent' | 'reset'>;
    const currentDomain = state[domainKey];
    
    // Update Metrics
    const total = currentDomain.metrics.total + 1;
    const escalated = event.decision === 'ESCALATE' ? currentDomain.metrics.escalated + 1 : currentDomain.metrics.escalated;
    const suspicious = event.decision === 'RESTRICT' ? currentDomain.metrics.suspicious + 1 : currentDomain.metrics.suspicious;
    const riskAvg = ((currentDomain.metrics.riskAvg * currentDomain.metrics.total) + event.riskScore) / total;

    // Update Trend (Rolling 60 points window)
    const newTrend = [...currentDomain.trend, { time: new Date().toLocaleTimeString(), value: event.riskScore }];
    if (newTrend.length > 60) newTrend.shift();

    // Update Events (Keep last 50)
    const newEvents = [event, ...currentDomain.events].slice(0, 50);

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
