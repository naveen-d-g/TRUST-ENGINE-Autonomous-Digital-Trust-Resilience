import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldCheck, User, Lock } from "lucide-react"
import { authStore } from "@/store/authStore"
import { Card } from "@/components/cards/Card"
import { Button } from "@/components/buttons/Button"
import { useNotificationStore } from "@/store/notificationStore"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"ADMIN" | "ANALYST">("ADMIN")

  const login = authStore((state) => state.login)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call for demo purposes
    setTimeout(() => {
      // Mock login - in production this would be an API call
      login({ 
        token: "mock-jwt-token", 
        user: {
            name: role === "ADMIN" ? "Admin User" : "Security Analyst",
            email: role === "ADMIN" ? "admin@trustengine.ai" : "analyst@trustengine.ai",
            role: role
        }
      })
      
      useNotificationStore.getState().push({ 
          type: "success", 
          message: `Welcome back, ${role}!` 
      })
      
      navigate(role === "ADMIN" ? "/dashboard" : "/soc")
      setIsLoading(false)
    }, 800)
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

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Identity</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@trustengine.ai"
                className="w-full bg-bgSecondary border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-neonBlue focus:ring-1 focus:ring-neonBlue transition-colors placeholder-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Clearance Level (Demo)</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                  role === "ADMIN"
                    ? "bg-neonRed/10 border-neonRed text-neonRed shadow-[0_0_10px_-4px_rgba(239,68,68,0.5)]"
                    : "border-gray-700 text-gray-400 hover:bg-gray-800"
                }`}
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => setRole("ANALYST")}
                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                  role === "ANALYST"
                    ? "bg-neonBlue/10 border-neonBlue text-neonBlue shadow-[0_0_10px_-4px_rgba(59,130,246,0.5)]"
                    : "border-gray-700 text-gray-400 hover:bg-gray-800"
                }`}
              >
                ANALYST
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Passcode</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-bgSecondary border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-neonBlue focus:ring-1 focus:ring-neonBlue transition-colors placeholder-gray-600"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading} variant="primary">
            Authenticate
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage
