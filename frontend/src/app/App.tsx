import { useEffect } from "react"
import { BrowserRouter } from "react-router-dom"
import { AppRouter } from "./router"
import { useAuthStore } from "@/store/authStore"
import { AuthProvider } from "@/auth/AuthContext"
import { AppProvider } from "@/context/AppContext"
import { ThemeProvider } from "@/context/ThemeContext"
import { LiveProvider } from "@/context/LiveContext"
import { TelemetryTracker } from "@/components/system/TelemetryTracker"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { bootstrapApp } from "@/store/bootstrapStore"

const queryClient = new QueryClient()

function App() {
  const checkAuth = useAuthStore(state => state.checkAuth)
  
  useEffect(() => {
    checkAuth()
    bootstrapApp().catch((error) => {
      console.error('Bootstrap failed:', error);
    });
  }, [checkAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <ThemeProvider>
            <LiveProvider>
              <BrowserRouter>
              <TelemetryTracker />
                <AppRouter />
              </BrowserRouter>
            </LiveProvider>
          </ThemeProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
