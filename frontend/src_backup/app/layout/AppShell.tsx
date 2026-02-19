import { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { ErrorBoundary } from "@/components/system/ErrorBoundary"
import { DevOverlay } from "@/components/system/DevOverlay"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useGlobalKeyboard } from "@/hooks/useGlobalKeyboard"

interface Props {
  children: ReactNode
}

export const AppShell = ({ children }: Props) => {
  useGlobalKeyboard() // Hook for global shortcuts

  return (
    <div className="flex h-screen bg-bgDark text-white overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64 transition-all duration-300">
        <Topbar />
        
        <main className="flex-1 overflow-auto p-6 relative">
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
