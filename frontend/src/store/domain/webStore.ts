import { create } from "zustand"

interface WebMetrics {
  activeSessions: number
  requestsPerSecond: number
  errorRate: number
  avgLatency: number
}

interface WebStore {
  metrics: WebMetrics
  riskScore: number
  status: "healthy" | "degraded" | "critical"
  updateMetrics: (metrics: Partial<WebMetrics>) => void
  setRiskScore: (score: number) => void
  setStatus: (status: "healthy" | "degraded" | "critical") => void
}

export const useWebStore = create<WebStore>((set) => ({
  metrics: {
    activeSessions: 0,
    requestsPerSecond: 0,
    errorRate: 0,
    avgLatency: 0,
  },
  riskScore: 0,
  status: "healthy",
  updateMetrics: (newMetrics) =>
    set((state) => ({ metrics: { ...state.metrics, ...newMetrics } })),
  setRiskScore: (score) => set({ riskScore: score }),
  setStatus: (status) => set({ status }),
}))
