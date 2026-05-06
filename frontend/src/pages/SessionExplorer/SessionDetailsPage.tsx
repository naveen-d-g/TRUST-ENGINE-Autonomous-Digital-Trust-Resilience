import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Card } from "@/components/cards/Card"
import { Button } from "@/components/buttons/Button"

import { 
    ArrowLeft, 
    Activity, 
    AlertTriangle, 
    Info, 
    CheckCircle, 
    ShieldAlert, 
    Zap, 
    Shield 
} from "lucide-react"
import { useSessionStore } from "@/store/sessionStore"
import { can } from '../../core/permissions/permissionUtils';
import { Permissions } from '../../core/permissions/permissions';

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface EvidenceItem {
    id: number;
    time: string;
    label: string;
    type: "info" | "warning" | "critical";
}

const SessionDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { sessions, selectedSession, fetchById, terminateSession, getSessionLogs, loading, error } = useSessionStore()
  const [logs, setLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const cachedSession = sessions.find(s => s.id === id);
  const session = selectedSession?.id === id ? selectedSession : cachedSession;

  useEffect(() => {
    if (id) {
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

  if (loading && !session) return <div className="p-6 text-gray-400 animate-pulse">Loading session intelligence...</div>
  if (error && !session) return <div className="p-6 text-red-400">Error loading session: {error}</div>
  if (!session) return <div className="p-6 text-gray-400">Session not found</div>

  // Generate Theme based on Decision
  let theme = {
      color: "text-gray-200",
      bg: "bg-gray-800/50",
      border: "border-gray-700",
      donut: "#22c55e",
      icon: Info,
      defaultRec: "Continuous Passive Monitoring"
  }

  const decision = session.decision?.toUpperCase() || 'ANALYZING';

  if (decision === 'RESTRICT' || decision === 'CHALLENGE') {
      theme = {
          color: "text-orange-500",
          bg: "bg-orange-500/10",
          border: "border-orange-500/20",
          donut: "#f97316",
          icon: AlertTriangle,
          defaultRec: "Monitor Closely"
      }
  } else if (decision === 'ESCALATE' || decision === 'TERMINATE' || decision === 'TERMINATED') {
      theme = {
          color: "text-red-500",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          donut: "#ef4444",
          icon: ShieldAlert,
          defaultRec: "Immediate Termination Recommended"
      }
  } else if (decision === 'ALLOW') {
      theme = {
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          donut: "#22c55e",
          icon: CheckCircle,
          defaultRec: "No Action Required"
      }
  }

  const IconComponent = theme.icon;

  // Derived Indicators
  const indicators = [];
  if (session.primaryCause) indicators.push(`Flag: ${session.primaryCause}`);
  if (session.riskScore > 50) {
      indicators.push("Trust score drops abruptly");
      indicators.push("High volume of unusual activity");
  } else {
      indicators.push("Behavior within normal parameters");
  }

  // Domain Confidence
  const domains = [
      { name: "Web Activity", score: session.riskScore > 70 ? 45 : 95, color: "bg-blue-500" },
      { name: "Network", score: session.riskScore > 90 ? 20 : 100, color: "bg-emerald-500" },
      { name: "Device Posture", score: 100, color: "bg-indigo-500" },
      { name: "API Access", score: Math.max(10, 100 - session.riskScore), color: "bg-orange-500" }
  ]

  const evidence: EvidenceItem[] = [
      { id: 1, time: session.timestamp.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }), label: "Session Initiated", type: "info" },
      session.primaryCause ? { id: 2, time: new Date(session.timestamp.getTime() + 1000).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }), label: `Flag: ${session.primaryCause}`, type: "warning" } : null,
      session.riskScore >= 50 ? { id: 3, time: new Date(session.timestamp.getTime() + 2000).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }), label: "High Risk Threshold Met", type: "critical" } : null
  ].filter((e): e is EvidenceItem => e !== null)

  const isTerminated = decision === 'TERMINATE' || decision === 'TERMINATED';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
           <Button variant="ghost" onClick={() => navigate(-1)} className="hover:bg-gray-800">
             <ArrowLeft className="w-5 h-5 text-gray-400" />
           </Button>
           <div>
               <div className="text-gray-500 text-xs font-medium tracking-widest uppercase mb-1">Session details</div>
               <h1 className="text-2xl font-black text-white tracking-widest uppercase">{session.primaryCause || 'Session Event'}</h1>
               <div className="text-gray-600 font-mono text-xs mt-1">{session.id}</div>
           </div>
        </div>
        
        <div className="flex gap-3">
             {can(Permissions.REPLAY_SESSION) && (
               <Button variant="secondary" onClick={handleViewLogs} className="bg-gray-800 hover:bg-gray-700 text-gray-300">
                   {showLogs ? 'Hide Raw Log' : 'View Raw Log'}
               </Button>
             )}
             {can(Permissions.TERMINATE_SESSION) && (
               <Button variant="danger" onClick={handleTerminate} disabled={isTerminated} className="bg-red-600 hover:bg-red-700 text-white font-bold">
                   {isTerminated ? 'TERMINATED' : 'TERMINATE SESSION'}
               </Button>
             )}
         </div>
      </div>

      {showLogs && (
          <Card className="max-h-96 overflow-y-auto bg-black border border-gray-800 font-mono text-xs p-0">
              <pre className="text-green-400 p-6">{JSON.stringify(logs, null, 2)}</pre>
          </Card>
      )}

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column (Decision, Indicators, Domains) */}
          <div className="flex-1 space-y-6">
              
              {/* Decision Box */}
              <div className="bg-[#0f1115] border border-gray-800/60 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 lg:gap-10 items-stretch shadow-xl">
                  {/* Decision Left */}
                  <div className="flex items-center gap-5 flex-1 border-b md:border-b-0 md:border-r border-gray-800/60 pb-6 md:pb-0 md:pr-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${theme.bg} ${theme.border}`}>
                          <IconComponent className={`w-7 h-7 ${theme.color}`} />
                      </div>
                      <div>
                          <div className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Current Decision</div>
                          <div className={`text-4xl font-black uppercase italic tracking-wider drop-shadow-md ${theme.color}`}>
                              {decision}
                          </div>
                      </div>
                  </div>
                  
                  {/* Decision Right (Recommendation) */}
                  <div className="flex-1 flex flex-col justify-center bg-gray-900/40 rounded-xl p-5 border border-gray-800/40">
                      <div className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Recommended Action</div>
                      <div className="text-gray-200 font-bold text-lg leading-tight mb-2">
                          {session.recommendedAction || theme.defaultRec}
                      </div>
                      <div className="text-gray-500 text-xs italic flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-70"></div>
                          Your security review matches with ML recommendation.
                      </div>
                  </div>
              </div>

              {/* Indicators & Domains Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Threat Indicators */}
                  <div className="bg-[#0f1115] border border-gray-800/60 rounded-2xl p-6 shadow-lg">
                      <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-yellow-500" />
                          Threat Indicators
                      </h3>
                      <div className="space-y-3">
                          {indicators.map((ind, idx) => (
                              <div key={idx} className="bg-gray-900/60 border border-gray-800/60 p-4 rounded-xl text-sm text-gray-300 font-medium flex items-start gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 shrink-0"></div>
                                  <span>{ind}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Domain Confidence */}
                  <div className="bg-[#0f1115] border border-gray-800/60 rounded-2xl p-6 shadow-lg">
                      <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-blue-500" />
                          Domain Confidence Scores
                      </h3>
                      <div className="space-y-5">
                          {domains.map((dom, idx) => (
                              <div key={idx}>
                                  <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                      <span>{dom.name}</span>
                                      <span className="text-white">{dom.score}%</span>
                                  </div>
                                  <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800/50">
                                      <div className={`h-full ${dom.color} transition-all duration-1000 ease-out`} style={{width: `${dom.score}%`}} />
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>

          {/* Right Column (Donut Chart) */}
          <div className="w-full lg:w-80 flex flex-col space-y-6">
              <div className="bg-[#0f1115] border border-gray-800/60 rounded-2xl p-6 shadow-lg flex-1 flex flex-col">
                  <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-center pt-2">
                      Session Trust Score
                  </h3>
                  <div className="flex-1 flex items-center justify-center relative min-h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              {/* Background ring */}
                              <Pie 
                                data={[{value: 100}]} 
                                dataKey="value" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={85} 
                                outerRadius={110} 
                                fill="#1f2937" 
                                stroke="none" 
                              />
                              {/* Foreground ring */}
                              <Pie 
                                data={[{value: session.trustScore}, {value: 100 - session.trustScore}]} 
                                dataKey="value" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={85} 
                                outerRadius={110} 
                                stroke="none" 
                                cornerRadius={12} 
                                startAngle={90} 
                                endAngle={-270}
                                animationDuration={1500}
                              >
                                  <Cell fill={theme.donut} />
                                  <Cell fill="transparent" />
                              </Pie>
                          </PieChart>
                      </ResponsiveContainer>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <div className="text-5xl font-black text-white tracking-tighter">
                              {session.trustScore.toFixed(1)}
                          </div>
                          <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-2 ${theme.color}`}>
                              {session.riskScore > 50 ? 'Risk' : 'Trust'}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Optional: Keep Evidence Timeline at bottom as requested in plan */}
      <div className="pt-6">
          <Card className="bg-[#0f1115] border-gray-800/60 shadow-lg">
              <div className="flex items-center gap-2 mb-6 text-white px-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold tracking-wide">Historical Evidence Timeline</h3>
              </div>
              <div className="space-y-6 px-2 pb-4">
                  {evidence.map((e: EvidenceItem, i) => (
                      <div key={i} className="flex gap-6 relative group">
                          <div className="text-[11px] text-gray-500 w-24 pt-0.5 font-mono text-right shrink-0">{e.time.split(', ')[1]}</div>
                          <div className="flex flex-col items-center relative z-10">
                              <div className={`w-3 h-3 rounded-full border-[3px] border-[#0f1115] ${
                                  e.type === "critical" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : 
                                  e.type === "warning" ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                              }`}></div>
                              {i < evidence.length - 1 && <div className="absolute top-3 bottom-[-24px] w-0.5 bg-gray-800 group-hover:bg-gray-700 transition-colors"></div>}
                          </div>
                          <div className="pb-2 flex-1">
                              <div className="text-sm text-gray-200 font-medium">{e.label}</div>
                              <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{e.type}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </Card>
      </div>
    </div>
  )
}

export default SessionDetailsPage
