import { create } from "zustand"

interface ApiMetrics {
  activeTokens: number
  rateLimitBreaches: number
  failedAuthAttempts: number
  p95Latency: number
}

interface ApiStore {
  metrics: ApiMetrics
  riskScore: number
  status: "healthy" | "degraded" | "critical"
  updateMetrics: (metrics: Partial<ApiMetrics>) => void
  setRiskScore: (score: number) => void
  setStatus: (status: "healthy" | "degraded" | "critical") => void
}

export const useApiStore = create<ApiStore>((set) => ({
  metrics: {
    activeTokens: 0,
    rateLimitBreaches: 0,
    failedAuthAttempts: 0,
    p95Latency: 0,
  },
  riskScore: 0,
  status: "healthy",
  updateMetrics: (newMetrics) =>
    set((state) => ({ metrics: { ...state.metrics, ...newMetrics } })),
  setRiskScore: (score) => set({ riskScore: score }),
  setStatus: (status) => set({ status }),
}))
