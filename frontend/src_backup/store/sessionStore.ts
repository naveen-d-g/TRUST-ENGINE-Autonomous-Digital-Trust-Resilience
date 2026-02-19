import { create } from "zustand"
import api from "@/services/api"
import { SessionModel } from "@/types/models"
import { SessionDTO } from "@/types/api"
import { mapSession } from "@/core/mappers/sessionMapper"
import { useNotificationStore } from "./notificationStore"

interface SessionState {
  sessions: SessionModel[]
  isLoading: boolean
  error: string | null
  fetchSessions: (query?: string) => Promise<void>
  addOrUpdateSession: (session: SessionModel) => void
}

export const sessionStore = create<SessionState>((set) => ({
  sessions: [],
  isLoading: false,
  error: null,
  
  fetchSessions: async (query = "") => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get<SessionDTO[]>("/sessions", { params: { q: query } })
      const mapped = data.map(mapSession)
      set({ sessions: mapped, isLoading: false })
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Failed to fetch sessions" })
      // Assuming 'useNotificationStore' is the new name for 'notificationStore'
      // and 'push' is the new method name for 'addAlert'.
      // The message and type are kept consistent with the original error message.
      useNotificationStore.getState().push({ type: "critical", message: "Failed to load sessions" })
    }
  },

  addOrUpdateSession: (session) => {
    set((state) => {
      const exists = state.sessions.find((s) => s.session_id === session.session_id)
      if (exists) {
        return {
          sessions: state.sessions.map((s) => (s.session_id === session.session_id ? session : s)),
        }
      }
      return { sessions: [session, ...state.sessions] }
    })
  },
}))
