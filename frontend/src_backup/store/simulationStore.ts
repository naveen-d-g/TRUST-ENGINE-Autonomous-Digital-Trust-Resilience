import { create } from "zustand"
import api from "@/services/api"

interface SimulationState {
  isRunning: boolean
  trustScore: number
  runAttack: (type: string) => Promise<void>
  resetDemo: () => Promise<void>
  updateTrustScore: (score: number) => void
}

export const simulationStore = create<SimulationState>((set) => ({
  isRunning: false,
  trustScore: 100,
  updateTrustScore: (score) => set({ trustScore: score }),
  runAttack: async (type) => {
    set({ isRunning: true })
    try {
      await api.post("/simulation/emit", { type })
    } finally {
      set({ isRunning: false })
    }
  },
  resetDemo: async () => {
    await api.post("/demo/reset")
    set({ trustScore: 100 })
  },
}))
