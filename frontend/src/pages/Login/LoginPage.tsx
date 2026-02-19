import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldCheck, User, Lock, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { Card } from "@/components/cards/Card"
import { Button } from "@/components/buttons/Button"
import { useNotificationStore } from "@/store/notificationStore"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const login = useAuthStore((state) => state.login)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
        await login(email, password)
        const user = useAuthStore.getState().user
        
        useNotificationStore.getState().addNotification(
            `Welcome back, ${user?.username || 'User'}!`,
            "success"
        )
        
        // Brief delay to ensure state is propagated
        setTimeout(() => {
            if (user?.role === "ADMIN") {
                navigate("/soc")
            } else if (user?.role === "ANALYST") {
                navigate("/soc")
            } else {
                navigate("/soc")
            }
        }, 100)
        
    } catch (err: any) {
        console.error("Login failed:", err)
        setError(err.response?.data?.message || "Invalid credentials. Please try again.")
        useNotificationStore.getState().addNotification(
            "Authentication failed",
            "error"
        )
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgPrimary relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-neonBlue/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-neonPurple/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

      <Card glow className="w-full max-w-md z-10 backdrop-blur-sm bg-bgCard/80">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-neonBlue/10 flex items-center justify-center mb-4 border border-neonBlue/50 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
            <ShieldCheck className="w-8 h-8 text-neonBlue" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider">TRUST<span className="text-neonBlue">ENGINE</span></h1>
          <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">Secure Access Portal</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-neonRed/10 border border-neonRed/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-neonRed shrink-0 mt-0.5" />
                <p className="text-sm text-neonRed/90">{error}</p>
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Identity</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username (admin/analyst)"
                className="w-full bg-bgSecondary border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-neonBlue focus:ring-1 focus:ring-neonBlue transition-colors placeholder-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Passcode</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bgSecondary border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-neonBlue focus:ring-1 focus:ring-neonBlue transition-colors placeholder-gray-600"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 text-base font-semibold shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.7)]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              "Authenticate"
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage

