import { create } from 'zustand';
import { runtimeConfig } from '../config/runtimeConfig';

interface ReplayEvent {
  id: string;
  timestamp: number;
  type: string;
  data: unknown;
}

interface ReplayState {
  events: ReplayEvent[];
  currentIndex: number;
  isPlaying: boolean;
  speed: number;
  
  // Actions
  loadEvents: (events: ReplayEvent[]) => void;
  play: () => void;
  pause: () => void;
  seek: (index: number) => void;
  setSpeed: (speed: number) => void;
  clear: () => void;
  next: () => void;
  prev: () => void;
}

export const useReplayStore = create<ReplayState>((set, get) => ({
  events: [],
  currentIndex: 0,
  isPlaying: false,
  speed: 1,

  loadEvents: (events: ReplayEvent[]) => {
    // Apply memory management - limit buffer size
    const maxSize = runtimeConfig.performance.maxReplayBufferSize;
    const limitedEvents = events.length > maxSize 
      ? events.slice(-maxSize) 
      : events;

    set({
      events: limitedEvents,
      currentIndex: 0,
      isPlaying: false,
    });
  },

  play: () => {
    set({ isPlaying: true });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  seek: (index: number) => {
    const { events } = get();
    if (index >= 0 && index < events.length) {
      set({ currentIndex: index });
    }
  },

  next: () => {
    const { currentIndex, events } = get();
    if (currentIndex < events.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  setSpeed: (speed: number) => {
    set({ speed: Math.max(0.25, Math.min(4, speed)) });
  },

  clear: () => {
    set({
      events: [],
      currentIndex: 0,
      isPlaying: false,
    });
  },
}));
