import { useState, useEffect } from "react"
import { api } from "@/services/api"
import { socketService } from "@/services/socket"
import { Card } from "@/components/cards/Card"
import { Button } from "@/components/buttons/Button"
import { TrustLineChart } from "@/components/charts/TrustLineChart"
import { LiveEventStream } from "@/components/cards/LiveEventStream"
import { Zap, ShieldOff, RotateCcw, ShieldAlert } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

const AttackSimulationPage = () => {
  const role = useAuthStore(s => s.user?.role) // RBAC
  const isAdmin = role === "ADMIN"

  const [isRunning, setIsRunning] = useState(false)
  const [internalScore, setInternalScore] = useState(100)
  const [decision, setDecision] = useState<string>("ALLOW")
  const [simulationId, setSimulationId] = useState<string | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [riskCause, setRiskCause] = useState<string | null>(null)
  const [recommendation, setRecommendation] = useState<string | null>(null)
  
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
        if (data.new_score !== undefined) setInternalScore(data.new_score)
        if (data.decision) setDecision(data.decision)
    }

    socketService.on("simulation_event", handleEvent)
    
    socketService.on("dashboard_update", (data: any) => {
        if (data.global_trust_score !== undefined) setInternalScore(data.global_trust_score)
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
        interface SimulationResponse {
            success: boolean;
            message: string;
            simulation_id: string;
            attack_type: string;
            trust_score: number;
            decision: string;
            analysis: any;
        }

        const response = await api.post<SimulationResponse>("/api/v1/simulate/attack", { 
            attack_type: type,
            simulation_id: simulationId
        })
        
        if (response.simulation_id) setSimulationId(response.simulation_id)
        if (response.trust_score !== undefined) setInternalScore(response.trust_score)
        if (response.decision) setDecision(response.decision)
        
        // Dynamic Risk Insights based on type
        if (response.trust_score < 60) {
            setRiskCause(response.analysis?.primary_cause || "Anomalous behavior combined with elevated activity")
            setRecommendation(response.analysis?.recommended_action || "Monitor Closely")
        } else {
            setRiskCause(null)
            setRecommendation(null)
        }
        
        setEvents(prev => [...prev, {
            id: Date.now().toString(),
            time: new Date().toLocaleTimeString(),
            type: "SUCCESS",
            message: `Attack ${label} initiated successfully - Trust Score: ${response.trust_score}`,
            variant: "success"
        }])
    } catch (err: any) {
        console.error("[CRITICAL] Attack Simulation Dispatch Failed:", err);
        const errorMsg = err.response?.data?.message || err.message || "Network Communication Error";
        setEvents(prev => [...prev, {
            id: Date.now().toString(),
            time: new Date().toLocaleTimeString(),
            type: "ERROR",
            message: `Dispatch Failed: ${errorMsg}`,
            variant: "danger"
        }])
    } finally {
        setIsRunning(false)
    }
}

  const handleReset = async () => {
    if (!isAdmin) return
    setInternalScore(100)
    setDecision("ALLOW")
    setSimulationId(null)
    setRiskCause(null)
    setRecommendation(null)
    setEvents([])
    try { await api.post("/api/simulate/reset", {}) } catch (e) {}
  }

  const [scoreHistory, setScoreHistory] = useState(
      Array.from({ length: 30 }, (_, i) => ({
          time: new Date(Date.now() - (30 - i) * 1000).toISOString(),
          score: 100
      }))
  )

  useEffect(() => {
      setScoreHistory(prev => {
          const newHistory = [...prev, { time: new Date().toISOString(), score: internalScore }]
          return newHistory.length > 30 ? newHistory.slice(newHistory.length - 30) : newHistory
      })
  }, [internalScore])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0A0E14] text-gray-100 font-sans">
      {/* Ultra-Compact Header */}
      <div className="flex justify-between items-center px-6 py-2 border-b border-gray-800/40 bg-gray-900/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="text-neonBlue w-4 h-4 shadow-[0_0_8px_rgba(0,195,255,0.4)]" />
            <h1 className="text-base font-black uppercase tracking-tight">Attack Lab</h1>
          </div>
          <p className="text-gray-500 text-[8px] font-black uppercase tracking-[0.2em] opacity-60 hidden sm:block">RED-TEAM SIMULATION & TRUST VALIDATION</p>
        </div>
        <Button variant="danger" onClick={handleReset} className="px-3 h-7 font-black uppercase tracking-[0.1em] text-[8px] flex items-center gap-2">
           <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
           RESET ENV
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-3 p-3 flex-1 overflow-hidden">
        <div className="col-span-3 flex flex-col gap-3 h-[calc(100vh-80px)] overflow-hidden">
          <Card className="flex flex-col bg-gray-900/20 border-gray-800/40 p-0 overflow-hidden flex-shrink">
            <div className="flex items-center gap-2 p-2 bg-gray-800/20 border-b border-gray-800/50">
               <Zap className="w-3 h-3 text-purple-400" />
               <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Simulation tools</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              {[
                { id: "bruteforce", label: "Brute Force", color: "border-l-red-500" },
                { id: "credential_stuffing", label: "Cred Stuffing", color: "border-l-red-500" },
                { id: "geo_hopping", label: "Impossible Travel", color: "border-l-red-500" },
                { id: "bot_activity", label: "Bot Pattern", color: "border-l-orange-500" },
                { id: "failed_login", label: "Targeted Fail", color: "border-l-orange-500" },
                { id: "captcha_failure", label: "Fail CAPTCHA", color: "border-l-yellow-600" },
                { id: "normal_visit", label: "Normal Visit", color: "border-l-green-500" },
              ].map(tool => (
                <button
                  key={tool.id}
                  onClick={() => handleAttack(tool.id, tool.label)}
                  disabled={isRunning || !isAdmin}
                  className={`w-full text-left p-2 rounded bg-gray-900/40 border-l-2 ${tool.color} border-t border-r border-b border-gray-800/30 hover:bg-gray-800/50 transition-all group relative`}
                >
                  <span className="block font-black text-[10px] text-gray-300 uppercase tracking-widest group-hover:text-white transition-colors">{tool.label}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="flex flex-col space-y-4 bg-gray-900/20 border-gray-800/40 p-0 overflow-hidden">
            <div className="flex items-center gap-2 p-3 bg-gray-800/20 border-b border-gray-800/50">
               <ShieldOff className="w-4 h-4 text-blue-400" />
               <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-300">Identity Actions</h2>
            </div>
            <div className="p-4 pt-2">
              <Button 
                variant="ghost" 
                className="w-full h-11 border border-blue-900/30 bg-blue-900/10 text-blue-300 font-black uppercase tracking-widest text-[9px] hover:bg-blue-900/20"
                onClick={() => handleAttack("password_reset", "Password Reset")}
              >
                Reset Password Flow
              </Button>
            </div>
          </Card>
        </div>

        {/* Center Panel: Trust Monitor */}
        <div className="col-span-6 flex flex-col gap-6 overflow-hidden">
          <Card className="flex-1 flex flex-col p-6 bg-gray-900/10 border-gray-800/40 relative overflow-hidden" glow>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tighter text-gray-100 italic">Live Trust Monitor</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Session ID:</span>
                  <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-tight">{simulationId || "NOT_INITIALIZED_ID"}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] block mb-2 opacity-80">Current Decision</span>
                <div className={`px-5 py-1.5 rounded border-2 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl ${
                    decision === "ALLOW" ? "border-neonGreen/30 text-neonGreen bg-neonGreen/5 shadow-neonGreen/5" :
                    decision === "CHALLENGE" ? "border-neonOrange/30 text-neonOrange bg-neonOrange/5 shadow-neonOrange/5" :
                    "border-neonRed/30 text-neonRed bg-neonRed/5 shadow-neonRed/10 animate-pulse"
                }`}>
                    {decision === "ALLOW" ? "Allow" : decision === "CHALLENGE" ? "Restrict" : "Escalate"}
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center -mt-6 relative z-10">
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-4 opacity-60">Trust Score</span>
               <div className={`text-9xl font-black tracking-tighter transition-all duration-700 drop-shadow-[0_0_30px_rgba(var(--neon-color),0.4)] ${
                  internalScore >= 60 ? "text-neonGreen [--neon-color:16,185,129]" : internalScore >= 30 ? "text-neonOrange [--neon-color:245,158,11]" : "text-neonRed [--neon-color:239,68,68]"
               }`}>
                  {Math.round(internalScore)}
               </div>
            </div>
            
            <div className="w-full h-64 mt-4 relative z-10">
               <TrustLineChart data={scoreHistory} height={250} color={internalScore >= 60 ? "#10b981" : internalScore >= 30 ? "#f59e0b" : "#ef4444"} />
            </div>

            {/* Insight Panel Match */}
            {(riskCause || recommendation) && (
              <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t border-gray-800/50 relative z-10">
                <div>
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] block mb-3 opacity-80">Primary Risk Cause</span>
                  <p className="text-sm text-neonRed font-black leading-tight uppercase tracking-tight drop-shadow-lg">{riskCause}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] block mb-3 opacity-80">Recommendation</span>
                  <div className="flex items-center gap-3 text-neonBlue bg-blue-500/5 p-2 rounded border border-blue-500/10">
                    <ShieldAlert className="w-4 h-4 shadow-neonBlue/50" />
                    <span className="text-xs font-black uppercase tracking-widest">{recommendation}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
          </Card>
        </div>

        {/* Right Panel: Event Stream */}
        <div className="col-span-3 h-full overflow-hidden">
          <Card className="h-full flex flex-col p-0 bg-gray-900/10 border-gray-800/40 overflow-hidden">
            <div className="p-4 bg-gray-800/20 border-b border-gray-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3 h-3 text-blue-400" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-300">Event Stream</h2>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-neonBlue animate-pulse" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <LiveEventStream events={events} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AttackSimulationPage
