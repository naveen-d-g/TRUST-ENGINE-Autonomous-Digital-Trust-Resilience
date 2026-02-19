import { authStore } from "@/store/authStore"

export type Role = "ADMIN" | "ANALYST" | "VIEWER"

export const permissions: Record<Role, string[]> = {
  ADMIN: ["LOCKDOWN", "CONTAIN", "EXPORT", "SIMULATE", "VIEW_INCIDENTS", "VIEW_SESSIONS", "VIEW_DASHBOARD"],
  ANALYST: ["VIEW_INCIDENTS", "VIEW_SESSIONS", "VIEW_DASHBOARD"],
  VIEWER: ["VIEW_DASHBOARD"]
}

export const usePermission = (action: string) => {
  const role = authStore(state => state.role)
  if (!role) return false
  return permissions[role]?.includes(action)
}
