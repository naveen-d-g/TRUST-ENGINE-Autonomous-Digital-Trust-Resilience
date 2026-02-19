import { create } from "zustand"

interface ReplayState {
  events: any[]
  index: number
  playing: boolean
  speed: number
  load: (events: any[]) => void
  play: () => void
  pause: () => void
  next: () => void
  prev: () => void
  setSpeed: (speed: number) => void
  setIndex: (index: number) => void
}

export const useReplayStore = create<ReplayState>((set, get) => ({
  events: [],
  index: 0,
  playing: false,
  speed: 1000,
  
  load: (events) => set({ events, index: 0, playing: false }),
  
  play: () => {
    set({ playing: true })
    const interval = setInterval(() => {
      const { index, events, playing } = get()
      if (!playing) {
          clearInterval(interval)
          return
      }
      if (index >= events.length - 1) {
        clearInterval(interval)
        set({ playing: false })
      } else {
        set({ index: index + 1 })
      }
    }, get().speed)
    // Basic interval implementation - in real app, use requestAnimationFrame for better timing
  },
  
  pause: () => set({ playing: false }),
  next: () => set((state) => ({ index: Math.min(state.index + 1, state.events.length - 1) })),
  prev: () => set((state) => ({ index: Math.max(state.index - 1, 0) })),
  setSpeed: (speed) => set({ speed }),
  setIndex: (index) => set({ index })
}))
