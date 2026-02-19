import { Suspense, lazy } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "./layout/AppLayout"
import { RoleGuard } from "@/core/guards/RoleGuard"
import { Spinner } from "@/components/loaders/Spinner"
import { authStore } from "@/store/authStore"

// Lazy Loads
const Login = lazy(() => import("@/pages/Login/LoginPage.tsx"))
const Dashboard = lazy(() => import("@/pages/Dashboard/DashboardPage.tsx"))
// Session Explorer
const SessionExplorer = lazy(() => import("@/pages/SessionExplorer/SessionExplorerPage.tsx"))
const SessionDetails = lazy(() => import("@/pages/SessionExplorer/SessionDetailsPage.tsx"))
// Simulation
const Simulation = lazy(() => import("@/pages/Simulation/AttackSimulationPage.tsx"))
// SOC
const SOC = lazy(() => import("@/pages/SOC/SocDashboard.tsx"))
const IncidentDetails = lazy(() => import("@/pages/SOC/IncidentDetail.tsx"))
// Domain
const WebSecurity = lazy(() => import("@/pages/Domain/WebSecurity.tsx"))
const ApiSecurity = lazy(() => import("@/pages/Domain/ApiSecurity.tsx"))
const NetworkSecurity = lazy(() => import("@/pages/Domain/NetworkSecurity.tsx"))
const InfraSecurity = lazy(() => import("@/pages/Domain/InfraSecurity.tsx"))
const DomainOverview = lazy(() => import("@/pages/Domain/DomainOverview.tsx"))
const Audit = lazy(() => import("@/pages/Audit/AuditPage.tsx"))


const FullScreenLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-bgPrimary">
    <Spinner className="w-12 h-12" />
  </div>
)

const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const token = authStore(state => state.token)
    if (token) return <Navigate to="/" replace />
    return children
}

export const AppRouter = () => {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        
        <Route element={<RoleGuard allowed={["ADMIN", "ANALYST", "VIEWER"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sessions" element={<SessionExplorer />} />
            <Route path="/sessions/:id" element={<SessionDetails />} />
            <Route path="/soc" element={<SOC />} />
            <Route path="/soc/incidents/:id" element={<IncidentDetails />} />
            
            {/* Domain Routes */}
            <Route path="/domain" element={<DomainOverview />} />
            <Route path="/domain/web" element={<WebSecurity />} />
            <Route path="/domain/api" element={<ApiSecurity />} />
            <Route path="/domain/network" element={<NetworkSecurity />} />
            <Route path="/domain/infra" element={<InfraSecurity />} />

            <Route path="/audit" element={<Audit />} />
            
            <Route element={<RoleGuard allowed={["ADMIN"]} />}>
               <Route path="/simulation" element={<Simulation />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
