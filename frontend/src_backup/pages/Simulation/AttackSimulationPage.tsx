import { useState, useEffect } from "react"
import api from "@/services/api"
import { socketService } from "@/services/socket"
import { Card } from "@/components/cards/Card"
import { Button } from "@/components/buttons/Button"
import { TrustScore } from "@/components/indicators/TrustScore"
import { TrustLineChart } from "@/components/charts/TrustLineChart"
import { LiveEventStream } from "@/components/cards/LiveEventStream"
import { Zap, ShieldOff, RotateCcw, Lock, ShieldAlert } from "lucide-react"
import { authStore } from "@/store/authStore"

const AttackSimulationPage = () => {
  const role = authStore(s => s.role) // RBAC
  const isAdmin = role === "ADMIN"

  const [isRunning, setIsRunning] = useState(false)
  const [internalScore, setInternalScore] = useState(100)
  const [events, setEvents] = useState<any[]>([])
  
  // Realtime Integration
  useEffect(() => {
    socketService.connect()

    const handleEvent = (data: any) => {
        setEvents(prev => [...prev, {
            id: Date.now().toString(),
            time: new Date().toLocaleTimeString(),
            type: "SIMULATION_EVENT",
            message: data.message || JSON.stringify(data),
            variant: "warning"
        }])
        if (data.new_score) setInternalScore(data.new_score)
    }

    socketService.on("simulation_event", handleEvent)
    
    socketService.on("dashboard_update", (data: any) => {
        if (data.global_trust_score) setInternalScore(data.global_trust_score)
    })

    return () => {
        socketService.off("simulation_event")
        socketService.off("dashboard_update")
    }
  }, [])

  const handleAttack = async (type: string, label: string) => {
    if (!isAdmin) return

    setIsRunning(true)
    setEvents(prev => [...prev, {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        type: "ATTACK_VECTOR",
        message: `Injecting ${label} sequence...`,
        variant: "danger"
    }])
    
    try {
        await api.post("/simulate/attack", { attack_type: type })
    } catch (err) {
        console.error("Attack failed", err)
        setEvents(prev => [...prev, {
            id: Date.now().toString(),
            time: new Date().toLocaleTimeString(),
            type: "ERROR",
            message: "Failed to dispatch attack command",
            variant: "danger"
        }])
    } finally {
        setIsRunning(false)
    }
  }

  const handleReset = async () => {
    if (!isAdmin) return

    setEvents(prev => [...prev, {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        type: "SYSTEM",
        message: "Resetting Simulation Environment...",
        variant: "info"
    }])
    setInternalScore(100)
    
    try {
        await api.post("/simulate/reset", {})
    } catch (e) {
        console.error(e)
    }
  }

  const chartData = Array.from({ length: 30 }, (_, i) => ({
      time: new Date(Date.now() - (30 - i) * 1000).toISOString(),
      score: internalScore
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
      {/* Left Panel: Attack Tools */}
      <Card className="lg:col-span-1 flex flex-col space-y-6">
        <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="text-neonOrange" />
                Attack Lab
            </h2>
            <p className="text-gray-400 text-xs mt-1">Inject malicious signals to test resilience.</p>
        </div>
        
        {!isAdmin && (
            <div className="bg-neonRed/10 border border-neonRed/50 rounded p-3 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-neonRed shrink-0 mt-0.5" />
                <div>
                    <span className="text-xs text-neonRed font-bold block">READ ONLY MODE</span>
                    <span className="text-[10px] text-gray-300">Only ADMINs can trigger attacks.</span>
                </div>
            </div>
        )}

        <div className="space-y-4 flex-1">
            <Button 
                variant="danger" 
                className="w-full justify-start h-12" 
                onClick={() => handleAttack("bruteforce", "Brute Force")}
                disabled={isRunning || !isAdmin}
            >
                <div className="flex flex-col items-start ml-2">
                    <span className="font-bold">Brute Force</span>
                </div>
            </Button>
            
            <Button 
                variant="danger" 
                className="w-full justify-start h-12"
                onClick={() => handleAttack("credential_stuffing", "Cred Stuffing")}
                disabled={isRunning || !isAdmin}
            >
                <div className="flex flex-col items-start ml-2">
                    <span className="font-bold">Credential Stuffing</span>
                </div>
            </Button>

            <Button 
                variant="danger" 
                className="w-full justify-start h-12"
                onClick={() => handleAttack("geo_hopping", "Geo Hopping")}
                disabled={isRunning || !isAdmin}
            >
                <div className="flex flex-col items-start ml-2">
                    <span className="font-bold">Impossible Travel</span>
                </div>
            </Button>

            <div className="border-t border-gray-800 my-4"></div>

            <Button 
                variant="secondary" 
                className="w-full justify-start h-12"
                onClick={() => handleAttack("velocity_check", "Velocity Check")}
                disabled={isRunning || !isAdmin}
            >
                <ShieldOff className="mr-2 h-4 w-4" />
                <span>Test Velocity Limits</span>
            </Button>
        </div>

        <Button 
            variant="ghost" 
            onClick={handleReset} 
            className="w-full border border-gray-700"
            disabled={!isAdmin}
        >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Environment
        </Button>
      </Card>

      {/* Center Panel: Trust Monitor */}
      <div className="lg:col-span-2 flex flex-col gap-6">
         <Card className="flex-1 flex flex-col items-center justify-center relative overflow-hidden" glow>
            <div className="absolute top-4 left-4">
                <div className="flex items-center space-x-2 bg-black/40 px-3 py-1 rounded-full border border-neonBlue/30">
                    <Lock className="w-3 h-3 text-neonBlue" />
                    <span className="text-xs text-neonBlue font-mono">SECURE CONTEXT</span>
                </div>
            </div>

            <div className="scale-150 mb-8">
                <TrustScore value={internalScore} size="lg" />
            </div>
            
            <div className="w-full px-8 h-48">
                <TrustLineChart data={chartData} height={200} />
            </div>
         </Card>
      </div>

      {/* Right Panel: Event Stream */}
      <div className="lg:col-span-1 h-full">
         <LiveEventStream events={events} />
      </div>
    </div>
  )
}

export default AttackSimulationPage
