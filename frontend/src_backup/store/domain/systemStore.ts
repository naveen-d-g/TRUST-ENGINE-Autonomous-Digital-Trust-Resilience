import { create } from "zustand"

interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskIo: number
  activeServices: number
}

interface SystemStore {
  metrics: SystemMetrics
  riskScore: number
  status: "healthy" | "degraded" | "critical"
  updateMetrics: (metrics: Partial<SystemMetrics>) => void
  setRiskScore: (score: number) => void
  setStatus: (status: "healthy" | "degraded" | "critical") => void
}

export const useSystemStore = create<SystemStore>((set) => ({
  metrics: {
    cpuUsage: 0,
    memoryUsage: 0,
    diskIo: 0,
    activeServices: 0,
  },
  riskScore: 0,
  status: "healthy",
  updateMetrics: (newMetrics) =>
    set((state) => ({ metrics: { ...state.metrics, ...newMetrics } })),
  setRiskScore: (score) => set({ riskScore: score }),
  setStatus: (status) => set({ status }),
}))
