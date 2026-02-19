import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Card } from "@/components/cards/Card"
import { Button } from "@/components/buttons/Button"

import { ArrowLeft, Activity, FileText } from "lucide-react"
import { sessionStore } from "@/store/sessionStore"
import { SessionModel } from "@/types/models"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import { ExplainabilityPanel } from "@/components/intelligence/ExplainabilityPanel"
import { MLExplanation } from "@/types/explainability"



interface EvidenceItem {
    id: number;
    time: string;
    label: string;
    type: "info" | "warning" | "critical";
}

const SessionDetailsPage = () => {
  // ... existing hooks
  
  const { id } = useParams()
  const navigate = useNavigate()
  const { sessions } = sessionStore()
  const [session, setSession] = useState<SessionModel | null>(null)

  useEffect(() => {
    if (id) {
       const found = sessions.find(s => s.session_id === id)
       setSession(found || null)
    }
  }, [id, sessions])

  // Mock ML Data (moved after state init)
  const mlExplanation: MLExplanation | undefined = session ? {
    risk_score: session.risk_score || 0,
    decision: session.risk_score > 80 ? "TRUSTED" : session.risk_score > 50 ? "SUSPICIOUS" : "MALICIOUS",
    feature_importance: [
        { feature: "Geo Velocity", weight: 0.85 },
        { feature: "Device Fingerprint", weight: -0.12 },
        { feature: "Request Rate", weight: 0.45 },
        { feature: "Time of Day", weight: 0.05 }
    ],
    anomaly_flags: ["Impossible Travel", "High Velocity"],
    llm_advisory: {
        recommendation: "Immediate administrative review required. User exhibited impossible travel between NY and Tokyo within 5 minutes.",
        confidence: 0.98
    }
  } : undefined

  if (!session) return <div className="p-6 text-gray-400">Loading session intelligence...</div>

  // Mock Intelligence Data
  const riskBreakdown = [
      { name: "Behavior", risk: 20 },
      { name: "Network", risk: session.risk_score < 50 ? 90 : 10 },
      { name: "Identity", risk: 5 },
      { name: "Device", risk: 15 }
  ]
  
  const trustData = [
      { name: "Trust", value: session.risk_score },
      { name: "Risk", value: 100 - session.risk_score }
  ]

  const evidence: EvidenceItem[] = [
      { id: 1, time: "10:00:05", label: "Login Success", type: "info" },
      { id: 2, time: "10:05:22", label: "High Velocity Page View", type: "warning" },
      session.risk_score < 50 ? { id: 3, time: "10:06:00", label: "Impossible Travel Detected", type: "critical" } : null
  ].filter((e): e is EvidenceItem => e !== null)

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
           <Button variant="ghost" onClick={() => navigate(-1)}>
             <ArrowLeft className="w-4 h-4" />
           </Button>
           <h1 className="text-2xl font-bold text-white tracking-wide">Session Intelligence</h1>
           <span className="text-gray-500 font-mono text-sm">{session.session_id}</span>
        </div>
        
        <div className="flex gap-2">
            <Button variant="secondary">View Raw Log</Button>
            <Button variant="danger">Terminate Session</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Trust & Risk */}
        <div className="space-y-6">
            <Card className="flex flex-col items-center justify-center p-6">
                <h3 className="text-gray-400 uppercase tracking-widest text-xs mb-4">Trust Score Analysis</h3>
                <div className="h-40 w-full relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={trustData}
                                innerRadius={40}
                                outerRadius={60}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                            >
                                <Cell fill="#22C55E" />
                                <Cell fill="#EF4444" />
                            </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <span className="text-2xl font-bold text-white">{session.risk_score}</span>
                     </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-gray-400 uppercase tracking-widest text-xs mb-4">Risk Factor Breakdown</h3>
                <div className="h-40 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={riskBreakdown} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={60} stroke="#6B7280" fontSize={12} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#111827' }} />
                            <Bar dataKey="risk" radius={[0, 4, 4, 0]} barSize={16}>
                                {riskBreakdown.map((e, i) => (
                                    <Cell key={i} fill={e.risk > 50 ? "#EF4444" : "#3B82F6"} />
                                ))}
                            </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                </div>
            </Card>
        </div>

        {/* Center Col: Evidence & ML */}
        <div className="md:col-span-2 space-y-6">
             {/* ML Explanation Block */}
             <ExplainabilityPanel explanation={mlExplanation} />

             {/* Evidence Timeline */}
             <Card>
                 <div className="flex items-center gap-2 mb-4 text-white">
                     <Activity className="w-5 h-5 text-neonBlue" />
                     <h3 className="font-bold">Evidence Timeline</h3>
                 </div>
                 <div className="space-y-4">
                     {evidence.map((e: EvidenceItem, i) => (
                         <div key={i} className="flex gap-4">
                             <div className="text-xs text-gray-500 w-16 pt-1 font-mono">{e.time}</div>
                             <div className="flex flex-col items-center">
                                 <div className={`w-3 h-3 rounded-full mt-1 ${
                                     e.type === "critical" ? "bg-neonRed" : 
                                     e.type === "warning" ? "bg-neonOrange" : "bg-neonBlue"
                                 }`}></div>
                                 {i < evidence.length - 1 && <div className="w-0.5 h-full bg-gray-800 my-1"></div>}
                             </div>
                             <div className="pb-4">
                                 <div className="text-sm text-white font-medium">{e.label}</div>
                             </div>
                         </div>
                     ))}
                 </div>
             </Card>

             {/* LLM Advisory */}
             <Card>
                 <div className="flex items-center gap-2 mb-4 text-neonGreen">
                     <FileText className="w-5 h-5" />
                     <h3 className="font-bold">Suggested Remediation</h3>
                 </div>
                 <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
                     <li>Step-up authentication (MFA) triggered automatically.</li>
                     <li>Watchlist added for IP subnet 192.168.x.x</li>
                     <li>Recommend forcing password reset if velocity persists.</li>
                 </ul>
             </Card>
        </div>
      </div>
    </div>
  )
}

export default SessionDetailsPage
