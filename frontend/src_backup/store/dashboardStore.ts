import { create } from "zustand"
import { DashboardMetrics } from "../types/dashboard"

interface DashboardState {
  metrics: DashboardMetrics | null
  setMetrics: (data: DashboardMetrics) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: null,
  setMetrics: (data) => set({ metrics: data })
}))
