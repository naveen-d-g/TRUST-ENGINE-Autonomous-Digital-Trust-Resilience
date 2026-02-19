
import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface RiskState {
  riskScore: number;
  velocity: number;
  domainScores: Record<string, number>;
}

export const useRiskStream = () => {
  const [riskState, setRiskState] = useState<RiskState>({
    riskScore: 42, // Baseline
    velocity: 0,
    domainScores: { web: 10, api: 15, network: 8, system: 5 },
  });

  const handleMessage = useCallback((event: unknown) => {
    const e = event as { type: string; payload: { global_score: number; velocity: number; domains: Record<string, number> } };
    if (e.type === 'RISK_UPDATE') {
      setRiskState(prev => ({
        riskScore: e.payload.global_score,
        velocity: e.payload.velocity,
        domainScores: e.payload.domains || prev.domainScores
      }));
    }
  }, []);

  useWebSocket(handleMessage);

  return riskState;
};
