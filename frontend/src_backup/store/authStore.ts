import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  token: string | null
  role: "ADMIN" | "ANALYST" | "VIEWER" | null
  user: { name: string; email: string; role: string } | null
  login: (data: { token: string; user: { name: string; email: string; role: "ADMIN" | "ANALYST" | "VIEWER" } }) => void
  logout: () => void
  refreshToken: () => Promise<void>
}

export const authStore = create(
  persist<AuthState>(
    (set, get) => ({
      token: null,
      role: null,
      user: null,
      login: (data) => set({ token: data.token, role: data.user.role, user: data.user }),
      logout: () => set({ token: null, role: null, user: null }),
      refreshToken: async () => {
          // usage of fetch to avoid circular dependency with api.ts
          try {
            const res = await fetch("/api/auth/refresh", {
                method: "POST",
                headers: { "Authorization": `Bearer ${get().token}` }
            })
            if (res.ok) {
                const data = await res.json()
                set({ token: data.token })
            } else {
                set({ token: null, role: null })
            }
          } catch (e) {
             set({ token: null, role: null })
          }
      }
    }),
    { name: "auth-storage" }
  )
)
