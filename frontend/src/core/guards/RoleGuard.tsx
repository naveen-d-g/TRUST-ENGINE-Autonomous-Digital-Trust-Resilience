import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

interface Props {
  allowed: string[]
  children?: React.ReactNode
}

export const RoleGuard = ({ allowed, children }: Props) => {
  const role = useAuthStore((state) => state.user?.role)

  if (!role || !allowed.includes(role)) {
    return <Navigate to="/login" replace /> // Or unauthorized page
  }

  return children ? <>{children}</> : <Outlet />
}
