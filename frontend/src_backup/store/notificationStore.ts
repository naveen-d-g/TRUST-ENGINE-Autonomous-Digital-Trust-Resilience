import { create } from "zustand"

export interface Notification {
  id: string
  message: string
  type: "info" | "warning" | "critical" | "success"
}

interface State {
  notifications: Notification[]
  push: (n: Omit<Notification, "id">) => void
  remove: (id: string) => void
}

export const useNotificationStore = create<State>((set) => ({
  notifications: [],
  push: (n) => {
    const id = Date.now().toString()
    set(state => ({
      notifications: [...state.notifications, { ...n, id }]
    }))
    
    // Auto dismiss
    setTimeout(() => {
        set(state => ({
            notifications: state.notifications.filter(n => n.id !== id)
        }))
    }, 5000)
  },
  remove: (id) => set(state => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}))
