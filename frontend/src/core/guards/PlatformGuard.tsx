import { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

interface Props {
  children: ReactNode
  requiredPlatform: "SOC" | "INGESTION"
}

export const PlatformGuard = ({ children, requiredPlatform }: Props) => {
  const role = useAuthStore((state) => state.user?.role)
  const location = useLocation()

  if (!role) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Admin/Analyst -> SOC Platform
  // Viewer -> Ingestion Platform (Hypothetically, or restricted view)
  
  const userPlatform = role === "ADMIN" || role === "ANALYST" ? "SOC" : "INGESTION"

  if (requiredPlatform === "SOC" && userPlatform !== "SOC") {
    return <Navigate to="/unauthorized" replace />
  }

  if (requiredPlatform === "INGESTION" && userPlatform === "SOC") {
    // Optional: Allow SOC users to see ingestion? Or strict separation?
    // Strict for now:
    // return <Navigate to="/soc" replace />
  }

  return <>{children}</>
}
