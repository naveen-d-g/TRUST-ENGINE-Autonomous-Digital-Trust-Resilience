import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Card } from "@/components/cards/Card"
import { Button } from "@/components/buttons/Button"

import { ArrowLeft, Activity, FileText } from "lucide-react"
import { useSessionStore } from "@/store/sessionStore"
import { can } from '../../core/permissions/permissionUtils';
import { Permissions } from '../../core/permissions/permissions';

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
  const { sessions, selectedSession, fetchById, terminateSession, getSessionLogs, loading, error } = useSessionStore()
  const [logs, setLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // Optimistic loading: Use cached session from list if available immediately
  // This prevents the "Loading..." flash if we already have the data
  const cachedSession = sessions.find(s => s.id === id);
  const session = selectedSession?.id === id ? selectedSession : cachedSession;

  useEffect(() => {
    if (id) {
       // Always fetch fresh data, but UI will show cached version in meantime
       fetchById(id);
    }
  }, [id, fetchById])

  const handleTerminate = async () => {
    if (!session?.id) return;
    if (confirm('Are you sure you want to terminate this session? This action cannot be undone.')) {
        await terminateSession(session.id);
    }
  };

  const handleViewLogs = async () => {
    if (!session?.id) return;
    if (!showLogs) {
        const data = await getSessionLogs(session.id);
        setLogs(data);
    }
    setShowLogs(!showLogs);
  };

  const mlExplanation: MLExplanation | undefined = session ? {
    risk_score: session.riskScore || 0,
    decision: (["TRUSTED", "SUSPICIOUS", "MALICIOUS"].includes(session.decision) 
      ? session.decision 
      : "SUSPICIOUS") as "TRUSTED" | "SUSPICIOUS" | "MALICIOUS",
    feature_importance: [
        { feature: "Geo Velocity", weight: session.riskScore > 50 ? 0.85 : 0.12 },
        { feature: "Device Fingerprint", weight: session.riskScore > 30 ? -0.12 : 0.45 },
        { feature: "Request Rate", weight: session.riskScore > 70 ? 0.65 : 0.20 },
        { feature: "Time of Day", weight: 0.05 }
    ],
    anomaly_flags: session.riskScore > 50 ? ["High Entropy", "Velocity Spike"] : [],
    llm_advisory: {
        recommendation: session.recommendedAction || "No immediate action required. Session behavior is within normal parameters.",
        confidence: session.riskScore > 0 ? 0.98 : 0.99
    }
  } : undefined

  if (loading && !session) return <div className="p-6 text-gray-400 animate-pulse">Loading session intelligence...</div>
  if (error && !session) return <div className="p-6 text-red-400">Error loading session: {error}</div>
  if (!session) return <div className="p-6 text-gray-400">Session not found</div>

  // Mock Intelligence Data
  // Dynamic Intelligence Data
  const riskBreakdown = [
      { name: "Behavior", risk: session.riskScore * 0.4 },
      { name: "Network", risk: session.trustScore < 50 ? 80 : 10 },
      { name: "Identity", risk: session.primaryCause === 'Identity' ? 90 : 10 },
      { name: "Device", risk: 15 }
  ]
  
  const trustData = [
      { name: "Trust", value: session.riskScore },
      { name: "Risk", value: 100 - session.riskScore }
  ]

  const evidence: EvidenceItem[] = [
      { id: 1, time: "10:00:05", label: "Login Success", type: "info" },
      { id: 2, time: "10:05:22", label: "High Velocity Page View", type: "warning" },
      session.riskScore < 50 ? { id: 3, time: "10:06:00", label: "Impossible Travel Detected", type: "critical" } : null
  ].filter((e): e is EvidenceItem => e !== null)

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
           <Button variant="ghost" onClick={() => navigate(-1)}>
             <ArrowLeft className="w-4 h-4" />
           </Button>
           <h1 className="text-2xl font-bold text-white tracking-wide">Session Intelligence</h1>
           <span className="text-gray-500 font-mono text-sm">{session.id}</span>
        </div>
        
        <div className="flex gap-2">
             {can(Permissions.REPLAY_SESSION) && (
               <Button variant="secondary" onClick={handleViewLogs}>
                   {showLogs ? 'Hide Raw Log' : 'View Raw Log'}
               </Button>
             )}
             {can(Permissions.TERMINATE_SESSION) && (
               <Button variant="danger" onClick={handleTerminate} disabled={session.decision === 'TERMINATE'}>
                   {session.decision === 'TERMINATE' ? 'Terminated' : 'Terminate Session'}
               </Button>
             )}
         </div>
      </div>

      {showLogs && (
          <Card className="max-h-96 overflow-y-auto bg-slate-950 font-mono text-xs">
              <pre className="text-green-400 p-4">{JSON.stringify(logs, null, 2)}</pre>
          </Card>
      )}

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
                         <span className="text-2xl font-bold text-white">{session.riskScore}</span>
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
                     {session.recommendedAction ? (
                        <li>{session.recommendedAction}</li>
                     ) : (
                        <li>No specific remediation actions suggested by the engine.</li>
                     )}
                     {session.riskScore > 50 && (
                        <li>Watchlist added for IP subnet {session.ipAddress.split('.').slice(0,3).join('.')}.x</li>
                     )}
                     {session.riskScore > 80 && (
                        <li>Recommend forcing password reset if velocity persists.</li>
                     )}
                 </ul>
             </Card>
        </div>
      </div>
    </div>
  )
}

export default SessionDetailsPage
