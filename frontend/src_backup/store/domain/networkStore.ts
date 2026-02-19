import { create } from "zustand"

interface NetworkMetrics {
  bytesIn: number
  bytesOut: number
  activeConnections: number
  blockedPackets: number
}

interface NetworkStore {
  metrics: NetworkMetrics
  riskScore: number
  status: "healthy" | "degraded" | "critical"
  updateMetrics: (metrics: Partial<NetworkMetrics>) => void
  setRiskScore: (score: number) => void
  setStatus: (status: "healthy" | "degraded" | "critical") => void
}

export const useNetworkStore = create<NetworkStore>((set) => ({
  metrics: {
    bytesIn: 0,
    bytesOut: 0,
    activeConnections: 0,
    blockedPackets: 0,
  },
  riskScore: 0,
  status: "healthy",
  updateMetrics: (newMetrics) =>
    set((state) => ({ metrics: { ...state.metrics, ...newMetrics } })),
  setRiskScore: (score) => set({ riskScore: score }),
  setStatus: (status) => set({ status }),
}))
