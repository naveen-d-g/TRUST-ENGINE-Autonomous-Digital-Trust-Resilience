import { create } from "zustand"
import { persist } from "zustand/middleware"

interface TenantState {
  currentTenantId: string
  tenants: { id: string; name: string }[]
  setTenant: (id: string) => void
}

export const useTenantStore = create(
  persist<TenantState>(
    (set) => ({
      currentTenantId: "default",
      tenants: [
          { id: "default", name: "Primary Organization" },
          { id: "subsidiary-a", name: "Subsidiary A (Asia)" },
          { id: "subsidiary-b", name: "Subsidiary B (EU)" }
      ],
      setTenant: (id) => set({ currentTenantId: id })
    }),
    { name: "tenant-storage" }
  )
)
