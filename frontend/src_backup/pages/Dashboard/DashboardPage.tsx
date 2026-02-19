import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard"
import { useDashboardStore } from "@/store/dashboardStore"
import { Card } from "@/components/cards/Card"
import { Activity, AlertCircle, Shield, Users, Zap } from "lucide-react"
import { SkeletonCard } from "@/components/loaders/SkeletonCard"
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from "recharts"

const COLORS = ['#22C55E', '#F59E0B', '#EF4444']; // Trusted, Suspicious, Malicious

const DashboardPage = () => {
  const { metrics } = useDashboardStore()
  useRealtimeDashboard()

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const decisionData = [
    { name: 'Trusted', value: metrics.decision_distribution.trusted },
    { name: 'Suspicious', value: metrics.decision_distribution.suspicious },
    { name: 'Malicious', value: metrics.decision_distribution.malicious },
  ]

  const domainData = [
    { name: 'Web', risk: metrics.domain_risk.web },
    { name: 'API', risk: metrics.domain_risk.api },
    { name: 'Network', risk: metrics.domain_risk.network },
    { name: 'Infra', risk: metrics.domain_risk.infra },
  ]

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-wide">SOC Intelligence Dashboard</h1>
        {metrics.critical_incidents > 0 && (
           <div className="flex items-center gap-2 bg-neonRed/10 border border-neonRed px-4 py-2 rounded-lg animate-pulse">
             <div className="w-3 h-3 bg-neonRed rounded-full"></div>
             <span className="text-neonRed font-bold text-sm">CRITICAL INCIDENT ACTIVE</span>
           </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4">
             <div className="p-3 bg-neonBlue/10 rounded-lg text-neonBlue">
                 <Shield className="w-6 h-6" />
             </div>
             <div>
                 <div className="text-gray-400 text-xs uppercase tracking-wider">Global Trust Score</div>
                 <div className={`text-2xl font-bold ${
                     metrics.global_trust_score > 80 ? 'text-neonGreen' : 
                     metrics.global_trust_score > 50 ? 'text-neonOrange' : 'text-neonRed'
                 }`}>
                     {metrics.global_trust_score.toFixed(1)}%
                 </div>
             </div>
        </Card>

        <Card className="flex items-center gap-4">
             <div className="p-3 bg-neonGreen/10 rounded-lg text-neonGreen">
                 <Users className="w-6 h-6" />
             </div>
             <div>
                 <div className="text-gray-400 text-xs uppercase tracking-wider">Active Sessions</div>
                 <div className="text-2xl font-bold text-white">
                     {metrics.active_sessions}
                 </div>
             </div>
        </Card>

        <Card className="flex items-center gap-4">
             <div className="p-3 bg-neonRed/10 rounded-lg text-neonRed">
                 <AlertCircle className="w-6 h-6" />
             </div>
             <div>
                 <div className="text-gray-400 text-xs uppercase tracking-wider">Critical Incidents</div>
                 <div className="text-2xl font-bold text-white">
                     {metrics.critical_incidents}
                 </div>
             </div>
        </Card>
        
        <Card className="flex items-center gap-4">
             <div className="p-3 bg-neonPurple/10 rounded-lg text-neonPurple">
                 <Zap className="w-6 h-6" />
             </div>
             <div>
                 <div className="text-gray-400 text-xs uppercase tracking-wider">Attack Ratio</div>
                 <div className="text-2xl font-bold text-white">
                     {(metrics.attack_ratio * 100).toFixed(1)}%
                 </div>
             </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Velocity */}
          <Card className="col-span-2">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-neonBlue" />
                  Risk Velocity
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.risk_velocity}>
                    <XAxis dataKey="timestamp" hide />
                    <YAxis domain={[0, 100]} stroke="#4B5563" />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }}
                        itemStyle={{ color: '#F3F4F6' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
          </Card>

          {/* Decision Distribution Donut */}
          <Card className="flex flex-col items-center justify-center">
               <h3 className="text-white font-semibold mb-4 w-full text-left">Decision Matrix</h3>
               <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={decisionData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {decisionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="flex gap-4 mt-4 text-xs">
                   {decisionData.map((d, i) => (
                       <div key={i} className="flex items-center gap-1">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                           <span className="text-gray-400">{d.name}</span>
                       </div>
                   ))}
               </div>
          </Card>
      </div>

      {/* Domain Risk Rows */}
      <div className="grid grid-cols-1">
          <Card>
              <h3 className="text-white font-semibold mb-6">Domain Risk Intensity</h3>
              <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={domainData} layout="vertical">
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={60} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                        <Bar dataKey="risk" radius={[0, 4, 4, 0]} barSize={20}>
                            {domainData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={
                                    entry.risk > 80 ? '#EF4444' :
                                    entry.risk > 50 ? '#F59E0B' : '#22C55E'
                                } />
                            ))}
                        </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              </div>
          </Card>
      </div>
    </div>
  )
}

export default DashboardPage
