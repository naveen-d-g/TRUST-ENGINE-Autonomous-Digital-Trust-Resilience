import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDashboardStore } from "@/store/dashboardStore"
import { Card } from "@/components/cards/Card"
import { Activity, Shield, Users, Zap, AlertTriangle, Cpu } from "lucide-react"
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis
} from "recharts"

const COLORS = ['#10B981', '#F59E0B', '#EF4444']; // Allow, Escalate, Restrict

const DashboardPage = () => {
  const navigate = useNavigate()
  const { data: metrics, loading, error, fetch } = useDashboardStore()

  useEffect(() => {
    fetch()
  }, [fetch])

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Synchronizing Intelligence...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)]">
        <Card className="p-12 text-center max-w-md border-red-500/20 bg-red-500/5">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Access Synchronizaton Failed</h3>
          <p className="text-gray-400 mb-8 font-medium">The intelligence engine returned a 403 Forbidden error. Permission hierarchy elevation required.</p>
          <button 
            onClick={() => fetch()} 
            className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-red-500 transition-all active:scale-95 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
          >
            Retry Authorization
          </button>
        </Card>
      </div>
    )
  }

  if (!metrics) return null

  const decisionData = [
    { name: 'Allow', value: metrics.decisionDistribution.trusted },
    { name: 'Escalate', value: metrics.decisionDistribution.suspicious },
    { name: 'Restrict', value: metrics.decisionDistribution.malicious },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield className="w-12 h-12 text-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Shield className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Avg Trust Score</span>
             </div>
             <div className="text-4xl font-black text-white tracking-tighter">
                {metrics.globalTrustScore.toFixed(1)}%
             </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Bot:Attack Ratio</span>
             </div>
             <div className="text-4xl font-black text-white tracking-tighter">
                {metrics.attackRatio.toFixed(2)}
             </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Activity className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Sessions</span>
             </div>
             <div className="text-4xl font-black text-white tracking-tighter">
                {metrics.totalSessions.toLocaleString()}
             </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:border-red-500/30 transition-all duration-500">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                    <Zap className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Detection Sensitivity</span>
             </div>
             <div className="text-4xl font-black text-white tracking-tighter uppercase">
                {metrics.detectionSensitivity}
             </div>
          </div>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Decision Distribution */}
        <Card className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1">Decision Distribution</h3>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em]">Policy Application</span>
            </div>
          </div>
          <div className="h-72 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={decisionData}
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {decisionData.map((_, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        className="filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0E14', borderColor: '#1F2937', borderRadius: '12px' }}
                    itemStyle={{ color: '#F3F4F6', fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total</span>
                <span className="text-2xl font-black text-white">{metrics.totalSessions}</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-8">
            {decisionData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{d.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Primary Risk Vectors */}
        <Card className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1">Primary Risk Vectors</h3>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em]">Cause Analysis</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.primaryRiskVectors} layout="vertical" margin={{ left: 100, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#4B5563" 
                    fontSize={10} 
                    fontWeight="bold"
                    width={100}
                    tick={{ fill: '#9CA3AF' }}
                />
                <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ backgroundColor: '#0A0E14', borderColor: '#1F2937', borderRadius: '12px' }}
                />
                <Bar 
                    dataKey="value" 
                    radius={[0, 4, 4, 0]} 
                    barSize={18}
                >
                    {metrics.primaryRiskVectors.map((_, index) => {
                        const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#EF4444'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-8">
         <Card className="p-8">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1">Domain Risk Breakdown</h3>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em]">Threat Surface</span>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { id: 'web', label: 'Web Security', value: metrics.domainRisk.web, icon: Shield, color: 'text-blue-500' },
                    { id: 'api', label: 'API Integrity', value: metrics.domainRisk.api, icon: Zap, color: 'text-amber-500' },
                    { id: 'network', label: 'Network Trust', value: metrics.domainRisk.network, icon: Cpu, color: 'text-purple-500' },
                    { id: 'system', label: 'Infra Resilience', value: metrics.domainRisk.infra, icon: Activity, color: 'text-emerald-500' },
                ].map((domain, i) => (
                    <div 
                      key={i} 
                      className="space-y-4 cursor-pointer group/domain"
                      onClick={() => navigate(`/domain/${domain.id}`)}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] group-hover/domain:text-white transition-colors">{domain.label}</span>
                            <span className={`text-xs font-black ${domain.value > 80 ? 'text-red-500' : 'text-white'}`}>{domain.value}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 group-hover/domain:from-white group-hover/domain:to-blue-400`} 
                                style={{ width: `${domain.value}%` }} 
                            />
                        </div>
                    </div>
                ))}
            </div>
         </Card>
      </div>
    </div>
  )
}

export default DashboardPage
