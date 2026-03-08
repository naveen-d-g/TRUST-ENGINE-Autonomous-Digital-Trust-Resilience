import { ReactNode, useState } from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { ErrorBoundary } from "@/components/system/ErrorBoundary"
import { DevOverlay } from "@/components/system/DevOverlay"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useGlobalKeyboard } from "@/hooks/useGlobalKeyboard"
import "@/behavior/mouseTracker"

interface Props {
  children: ReactNode
}

export const AppShell = ({ children }: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  useGlobalKeyboard() // Hook for global shortcuts

  return (
    <div className="flex h-screen bg-bgDark text-white font-sans overflow-x-hidden">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300 relative z-10`}>
        <Topbar />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative z-0">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      <DevOverlay />
      <ToastContainer />
      {/* <GlobalModalRoot />  -- To be implemented if standard modal system needed */}
    </div>
  )
}
