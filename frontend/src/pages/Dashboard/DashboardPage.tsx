import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDashboardStore } from "@/store/dashboardStore"
import { Card } from "@/components/cards/Card"
import { Activity, Shield, Users, Zap, AlertTriangle, TrendingUp, TrendingDown, Target, MousePointer2 } from "lucide-react"
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis
} from "recharts"

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1']; // Allow, Escalate, Restrict, Other

const DashboardPage = () => {
  const navigate = useNavigate()
  const { data: metrics, loading, error, fetch } = useDashboardStore()

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, 10000) // Polling every 10s
    return () => clearInterval(interval)
  }, [fetch])

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-400/5 rounded-full animate-pulse" />
          </div>
          <span className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Synchronizing Intelligence Engine...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)]">
        <Card className="p-12 text-center max-w-md border-red-500/20 bg-red-500/5 backdrop-blur-xl rounded-[2rem]">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Sync Interruption</h3>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">The connection to the neural processing unit was disrupted. Security protocols may be inhibiting data flow.</p>
          <button 
            onClick={() => fetch()} 
            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:brightness-110 transition-all active:scale-95 shadow-[0_20px_40px_-15px_rgba(239,68,68,0.4)]"
          >
            Retry Neural Link
          </button>
        </Card>
      </div>
    )
  }

  if (!metrics) return null

  const total = metrics.decisionDistribution.trusted + metrics.decisionDistribution.suspicious + metrics.decisionDistribution.malicious || 1;
  const decisionData = [
    { name: 'Allow', value: metrics.decisionDistribution.trusted, percent: ((metrics.decisionDistribution.trusted / total) * 100).toFixed(1), color: COLORS[0] },
    { name: 'Escalate', value: metrics.decisionDistribution.suspicious, percent: ((metrics.decisionDistribution.suspicious / total) * 100).toFixed(1), color: COLORS[1] },
    { name: 'Restrict', value: metrics.decisionDistribution.malicious, percent: ((metrics.decisionDistribution.malicious / total) * 100).toFixed(1), color: COLORS[2] },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">Analyst Intelligence</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em]">Aggregated Threat Telemetry & Decision Matrix</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 py-2 px-4 rounded-xl border border-white/5 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Live Sync: Active</span>
        </div>
      </div>

      {/* Hero Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'Avg Trust Score', 
            val: `${metrics.globalTrustScore.toFixed(1)}%`, 
            icon: Shield, 
            color: 'blue',
            trend: metrics.globalTrustScore > 80 ? 'up' : 'down',
            details: 'Real-time confidence index'
          },
          { 
            title: 'Bot:Attack Ratio', 
            val: metrics.attackRatio.toFixed(2), 
            icon: Target, 
            color: 'indigo',
            trend: metrics.attackRatio < 0.1 ? 'up' : 'down',
            details: 'Automation vs Malice'
          },
          { 
            title: 'Total Sessions', 
            val: metrics.totalSessions.toLocaleString(), 
            icon: Users, 
            color: 'amber',
            trend: 'none',
            details: 'Intercepted signals'
          },
          { 
            title: 'Sensitivity', 
            val: metrics.detectionSensitivity, 
            icon: Activity, 
            color: 'red',
            trend: 'none',
            details: 'Engine Precision Mode'
          },
        ].map((m, i) => (
          <Card 
            key={i}
            className={clsx(
              "relative overflow-hidden p-6 border-white/5 bg-gradient-to-br transition-all duration-500 group rounded-[2rem]",
              m.color === 'blue' ? "from-blue-600/10 to-transparent hover:border-blue-500/30" :
              m.color === 'indigo' ? "from-indigo-600/10 to-transparent hover:border-indigo-500/30" :
              m.color === 'amber' ? "from-amber-600/10 to-transparent hover:border-amber-500/30" :
              "from-red-600/10 to-transparent hover:border-red-500/30"
            )}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start justify-between">
                <div className={clsx(
                    "p-3 rounded-2xl border transition-all duration-500",
                    m.color === 'blue' ? "bg-blue-500/10 border-blue-500/20 text-blue-500 group-hover:bg-blue-500 group-hover:text-white" :
                    m.color === 'indigo' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white" :
                    m.color === 'amber' ? "bg-amber-500/10 border-amber-500/20 text-amber-500 group-hover:bg-amber-500 group-hover:text-white" :
                    "bg-red-500/10 border-red-500/20 text-red-500 group-hover:bg-red-500 group-hover:text-white"
                )}>
                  <m.icon className="w-5 h-5" />
                </div>
                {m.trend !== 'none' && (
                    <div className={clsx(
                        "flex items-center gap-1 text-[10px] font-black",
                        m.trend === 'up' ? "text-emerald-500" : "text-red-500"
                    )}>
                        {m.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {m.trend === 'up' ? '+2.4%' : '-1.8%'}
                    </div>
                )}
              </div>
              <div className="mt-6">
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{m.title}</div>
                <div className="text-4xl font-black text-white tracking-tighter group-hover:scale-105 transition-transform origin-left duration-500">
                  {m.val}
                </div>
                <div className="text-[10px] font-medium text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {m.details}
                </div>
              </div>
            </div>
            {/* Ambient Background Glow */}
            <div className={clsx(
                "absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-1000",
                m.color === 'blue' ? "bg-blue-500" :
                m.color === 'indigo' ? "bg-indigo-500" :
                m.color === 'amber' ? "bg-amber-500" :
                "bg-red-500"
            )} />
          </Card>
        ))}
      </div>

      {/* Mouse Bot Detection Section */}
      <Card className="p-8 bg-gradient-to-r from-blue-600/10 via-transparent to-indigo-600/10 border-white/5 backdrop-blur-3xl rounded-[2.5rem] relative group overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] -z-10 group-hover:bg-blue-500/20 transition-all duration-1000" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
              <MousePointer2 className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">Mouse Behavior Bot Detection</h3>
              <p className="text-gray-400 text-xs font-medium tracking-wide">Real-time XGBoost Behavioral Classification Engine</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 items-center">
            <div className="text-center">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Bot Probability</div>
              <div className="text-3xl font-black text-emerald-500 tracking-tighter">12.4%</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Movement Entropy</div>
              <div className="text-3xl font-black text-blue-400 tracking-tighter">2.84</div>
            </div>
            <div className="text-center hidden md:block">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Behavior Risk</div>
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest inline-block">Low Risk</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-12 w-[1px] bg-white/10 hidden lg:block" />
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 Engine Active
               </span>
               <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Continuous Telemetry</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Policy Application Pie Chart */}
        <Card className="p-10 bg-gray-900/40 border-white/5 backdrop-blur-2xl rounded-[3rem] relative group/card overflow-hidden h-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col gap-1 mb-6 relative z-10">
              <h3 className="text-xl font-black text-white uppercase tracking-wider">Policy Enforcement</h3>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">Autonomous Decision Distribution</span>
          </div>

          <div className="relative h-[280px] w-full flex items-center justify-center z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={decisionData.filter(d => d.value > 0)}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  animationBegin={200}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {decisionData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell 
                        key={index} 
                        fill={entry.color} 
                        className="filter drop-shadow-[0_0_12px_rgba(255,255,255,0.05)] cursor-pointer hover:opacity-80 transition-opacity outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                    cursor={false}
                    wrapperStyle={{ zIndex: 100 }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                                <div className="bg-black/95 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-200">
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{data.name} Profile</div>
                                    <div className="text-2xl font-black text-white">{data.value.toLocaleString()} <span className="text-gray-500 text-xs font-medium">hits</span></div>
                                    <div className="text-emerald-500 text-xs font-black mt-1.5 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        {data.percent}% Market Share
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Centered Total Display - More Subtle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <div className="flex flex-col items-center justify-center">
                    <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-0.5 opacity-60">Total</span>
                    <span className="text-5xl font-black text-white tracking-tighter tabular-nums leading-none">
                        {metrics.totalSessions}
                    </span>
                    <span className="text-gray-400 text-[8px] font-bold uppercase tracking-[0.2em] mt-2 opacity-40">Signals</span>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-10 relative z-10">
            {decisionData.map((d, i) => (
              <div key={i} className="flex flex-col items-center group/item cursor-help">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover/item:text-blue-400 transition-colors">{d.name}</span>
                </div>
                <div className="text-xl font-black text-white tracking-widest tabular-nums">{d.percent}%</div>
                <div className="w-full h-1 bg-gray-800 rounded-full mt-3 overflow-hidden">
                    <div 
                        className="h-full transition-all duration-1000 ease-out"
                        style={{ backgroundColor: d.color, width: `${d.percent}%` }}
                    />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk Vectors Analysis */}
        <Card className="p-10 bg-gray-900/40 border-white/5 backdrop-blur-2xl rounded-[3rem] relative overflow-hidden group/card">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col gap-1 mb-10 relative z-10">
              <h3 className="text-xl font-black text-white uppercase tracking-wider">Risk Vector Analysis</h3>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">Primary Threat Classification</span>
          </div>

          <div className="h-[400px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.primaryRiskVectors} layout="vertical" margin={{ left: 120, right: 40, top: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="none"
                    fontSize={10} 
                    fontWeight="black"
                    width={120}
                    tick={(props) => (
                        <g transform={`translate(${props.x},${props.y})`}>
                            <text 
                                x={-10} 
                                y={0} 
                                dy={4} 
                                textAnchor="end" 
                                fill="#9CA3AF" 
                                className="text-[9px] uppercase tracking-tighter"
                            >
                                {props.payload.value}
                            </text>
                        </g>
                    )}
                />
                <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{payload[0].payload.name}</div>
                                    <div className="text-2xl font-black text-blue-400">{payload[0].value}% Impact</div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar 
                    dataKey="value" 
                    radius={[0, 10, 10, 0]} 
                    barSize={24}
                    animationBegin={400}
                    animationDuration={1500}
                >
                    {metrics.primaryRiskVectors.map((_, index) => {
                        const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#EF4444'];
                        return <Cell key={index} fill={colors[index % colors.length]} />;
                    })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Domain Resilience Breakdown */}
      <Card className="p-10 bg-gray-900/40 border-white/5 backdrop-blur-2xl rounded-[3rem] relative overflow-hidden group/card shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] pointer-events-none transition-all duration-1000 group-hover/card:bg-blue-500/10" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Domain Integrity Matrix</h3>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Cross-Surface Vulnerability Exposure</span>
            </div>
            <div className="p-1 bg-white/5 rounded-2xl flex items-center gap-1 border border-white/5">
                {['24H', '7D', '30D'].map((t) => (
                    <button key={t} className={clsx(
                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                        t === '24H' ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
                    )}>{t}</button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
                { id: 'web', label: 'Web Security', value: metrics.domainRisk.web, icon: Globe, color: 'blue' },
                { id: 'api', label: 'API Integrity', value: metrics.domainRisk.api, icon: Zap, color: 'amber' },
                { id: 'network', label: 'Network Trust', value: metrics.domainRisk.network, icon: Activity, color: 'purple' },
                { id: 'system', label: 'Infra Resilience', value: metrics.domainRisk.infra, icon: Server, color: 'emerald' },
            ].map((domain, i) => (
                <div 
                    key={i} 
                    className="relative group/domain cursor-pointer"
                    onClick={() => navigate(`/domain/${domain.id}`)}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={clsx(
                                "p-2 rounded-xl transition-all duration-500 border border-white/5",
                                domain.color === 'blue' ? "bg-blue-500/10 text-blue-500 group-hover/domain:bg-blue-500 group-hover/domain:text-white" :
                                domain.color === 'amber' ? "bg-amber-500/10 text-amber-500 group-hover/domain:bg-amber-500 group-hover/domain:text-white" :
                                domain.color === 'purple' ? "bg-purple-500/10 text-purple-500 group-hover/domain:group-hover/domain:bg-purple-500 group-hover/domain:text-white" :
                                "bg-emerald-500/10 text-emerald-500 group-hover/domain:bg-emerald-500 group-hover/domain:text-white"
                            )}>
                                <domain.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover/domain:text-white transition-colors">{domain.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className={clsx(
                                "text-2xl font-black tracking-tighter tabular-nums",
                                domain.value > 80 ? 'text-red-500 animate-pulse' : 'text-white'
                            )}>
                                {domain.value.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold">%</span>
                        </div>
                    </div>
                    
                    {/* Progress Bar Container */}
                    <div className="relative h-2 w-full bg-gray-800/50 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className={clsx(
                                "h-full transition-all duration-[2000ms] ease-out rounded-full",
                                domain.color === 'blue' ? "bg-gradient-to-r from-blue-600 to-blue-400" :
                                domain.color === 'amber' ? "bg-gradient-to-r from-amber-600 to-amber-400" :
                                domain.color === 'purple' ? "bg-gradient-to-r from-purple-600 to-purple-400" :
                                "bg-gradient-to-r from-emerald-600 to-emerald-400"
                            )} 
                            style={{ width: `${domain.value}%` }} 
                        />
                        {/* Glow effect on progress handle */}
                        <div 
                            className="absolute top-0 h-full w-4 blur-sm opacity-50 bg-white group-hover/domain:opacity-80 transition-opacity duration-500"
                            style={{ left: `calc(${domain.value}% - 10px)` }}
                        />
                    </div>
                    
                    {/* Description */}
                    <p className="text-[9px] text-gray-600 mt-4 leading-relaxed font-medium uppercase tracking-tighter opacity-70 group-hover/domain:opacity-100 transition-opacity">
                        {domain.value > 50 ? 'Surface exposure detected. Mitigation required.' : 'Domain stability verified via neural audit.'}
                    </p>
                </div>
            ))}
        </div>
      </Card>
    </div>
  )
}

// Support Icons
const Globe = (props: any) => <GlobeIcon {...props} />
const Server = (props: any) => <ServerIcon {...props} />
import { Globe as GlobeIcon, Server as ServerIcon } from "lucide-react"

import clsx from "clsx"

export default DashboardPage
