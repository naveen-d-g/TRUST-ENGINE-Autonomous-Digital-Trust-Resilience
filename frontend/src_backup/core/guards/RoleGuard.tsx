import { Navigate, Outlet } from "react-router-dom"
import { authStore } from "@/store/authStore"

interface Props {
  allowed: string[]
  children?: React.ReactNode
}

export const RoleGuard = ({ allowed, children }: Props) => {
  const role = authStore((state) => state.role)

  if (!role || !allowed.includes(role)) {
    return <Navigate to="/login" replace /> // Or unauthorized page
  }

  return children ? <>{children}</> : <Outlet />
}
