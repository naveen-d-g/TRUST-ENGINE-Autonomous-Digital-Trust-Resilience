import { Suspense, lazy } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "./layout/AppLayout"
import { RoleGuard } from "@/core/guards/RoleGuard"
import { Spinner } from "@/components/loaders/Spinner"
import { useAuthStore } from "@/store/authStore"

// Lazy Loads
const Login = lazy(() => import("@/pages/Login/LoginPage"))
const Dashboard = lazy(() => import("@/pages/Dashboard/DashboardPage"))
// Session Explorer
const SessionExplorer = lazy(() => import("@/pages/SessionExplorer/SessionExplorerPage"))
const SessionDetails = lazy(() => import("@/pages/SessionExplorer/SessionDetailsPage"))
// Simulation
const Simulation = lazy(() => import("@/pages/Simulation/AttackSimulationPage"))
// SOC
const SOC = lazy(() => import("@/pages/SOC/UnifiedSocMonitor"))
const LiveMonitor = SOC // Unified component for both routes
const IncidentDetails = lazy(() => import("@/pages/SOC/IncidentDetail"))
const HomeV1 = lazy(() => import("@/pages/public/HomeV1"))

// Home Landing
const WebSecurity = lazy(() => import("@/pages/Domain/WebSecurity"))
const ApiSecurity = lazy(() => import("@/pages/Domain/ApiSecurity"))
const NetworkSecurity = lazy(() => import("@/pages/Domain/NetworkSecurity"))
const InfraSecurity = lazy(() => import("@/pages/Domain/InfraSecurity"))
const DomainOverview = lazy(() => import("@/pages/Domain/DomainOverview"))
const Audit = lazy(() => import("@/pages/Audit/AuditPage"))
const BatchPage = lazy(() => import("@/pages/Batch/BatchPage"))


const FullScreenLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-bgPrimary">
    <Spinner className="w-12 h-12" />
  </div>
)

const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const token = useAuthStore(state => state.token)
    if (token) return <Navigate to="/" replace />
    return children
}

export const AppRouter = () => {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeV1 />} />
          
          <Route element={<RoleGuard allowed={["ADMIN", "ANALYST", "VIEWER"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sessions" element={<SessionExplorer />} />
            <Route path="/sessions/:id" element={<SessionDetails />} />
            <Route path="/soc" element={<SOC />} />
            <Route path="/live" element={<LiveMonitor />} />
            <Route path="/soc/incidents/:id" element={<IncidentDetails />} />
            <Route path="/batch" element={<BatchPage />} />
            
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
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
