import { useEffect } from "react"
import { Card } from "@/components/cards/Card"
import { useMonitoringStore } from "@/store/monitoringStore"
import { useDashboardStore } from "@/store/dashboardStore"
import { Shield, AlertTriangle, Activity, Lock, Database, AlertCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

const InfraSecurityPage = () => {
  const { system } = useMonitoringStore()
  const { data: metrics, fetch } = useDashboardStore()
  
  useEffect(() => {
      fetch()
  }, [fetch])

  const recommendation = metrics?.domainRecommendations?.infra

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-3 text-neonRed">
        <Database className="w-8 h-8" />
        <h1 className="text-2xl font-bold tracking-wide text-white">Domain: Infra Security</h1>
      </div>

      {/* Action Required Alert */}
      {recommendation && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-red-500 w-6 h-6 mt-1 shrink-0" />
            <div>
                <h3 className="text-white font-bold uppercase text-sm tracking-wider">ACTION REQUIRED</h3>
                <p className="text-gray-300 mt-1">Recommendation: <span className="text-white font-semibold">{recommendation}</span></p>
            </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-neonBlue/20 bg-gray-900/40 backdrop-blur">
          <div className="flex justify-between items-start">
             <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Syscalls</div>
                <div className="text-2xl font-bold text-white mt-1">{system.metrics.total}</div>
             </div>
             <Activity className="text-neonBlue" />
          </div>
        </Card>
        <Card className="border-neonOrange/20 bg-gray-900/40 backdrop-blur">
          <div className="flex justify-between items-start">
             <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Anomalies</div>
                <div className="text-2xl font-bold text-neonOrange mt-1">{system.metrics.suspicious}</div>
             </div>
             <AlertTriangle className="text-neonOrange" />
          </div>
        </Card>
        <Card className="border-neonRed/20 bg-gray-900/40 backdrop-blur">
          <div className="flex justify-between items-start">
             <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Root Access</div>
                <div className="text-2xl font-bold text-neonRed mt-1">{system.metrics.escalated}</div>
             </div>
             <Lock className="text-neonRed" />
          </div>
        </Card>
        <Card className="border-neonPurple/20 bg-gray-900/40 backdrop-blur">
          <div className="flex justify-between items-start">
             <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Avg Risk</div>
                <div className="text-2xl font-bold text-neonPurple mt-1">{Math.round(system.metrics.riskAvg)}</div>
             </div>
             <Shield className="text-neonPurple" />
          </div>
        </Card>
      </div>

      {/* Event Velocity Chart */}
      <Card className="border-gray-800 bg-gray-900/40 backdrop-blur p-6">
        <h3 className="text-white font-bold mb-6 text-lg">Event Velocity (Real-time)</h3>
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={system.trend}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis 
                        dataKey="time" 
                        stroke="#9CA3AF" 
                        tick={{fontSize: 12}}
                        tickFormatter={(time) => time.split(' ')[0]}
                        interval={9}
                        label={{ value: 'Time (HH:MM:SS)', position: 'insideBottomRight', offset: -5, fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <YAxis 
                        stroke="#9CA3AF" 
                        tick={{fontSize: 12}} 
                        label={{ value: 'Risk Score (0-100)', angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontSize: 12, style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }}
                        itemStyle={{ color: '#F3F4F6' }}
                    />
                    <Line 
                        type="stepAfter" 
                        dataKey="value" 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        dot={false} 
                        activeDot={{ r: 4, fill: '#f87171' }}
                        name="Risk Score"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </Card>

      {/* Live Events Table */}
      <Card className="border-gray-800 bg-gray-900/40 backdrop-blur overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-white font-bold">Live System Events</h3>
            <span className="text-xs font-mono text-neonRed bg-neonRed/10 px-2 py-1 rounded">STREAM: SYSTEM</span>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-400">
                  <thead className="text-xs uppercase bg-gray-800/50 text-gray-300">
                      <tr>
                          <th className="px-6 py-3">Timestamp</th>
                          <th className="px-6 py-3">Severity</th>
                          <th className="px-6 py-3">Details</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                      {system.events.length > 0 ? (
                        system.events.map((event, i) => (
                          <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                              <td className="px-6 py-4 font-mono text-xs">{new Date(event.timestamp).toLocaleTimeString()}</td>
                              <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                    event.riskScore > 80 ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 
                                    event.riskScore > 50 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50' : 
                                    'bg-blue-900/30 text-blue-400 border border-blue-900/50'
                                  }`}>
                                      {event.riskScore > 80 ? 'CRITICAL' : event.riskScore > 50 ? 'WARNING' : 'INFO'}
                                  </span>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                      <span className="text-white font-medium mb-1">{event.type}</span>
                                      <span className="text-xs font-mono text-gray-500">
                                          {`{ "host": "${event.ip}", "process": "${event.route}", "decision": "${event.decision}" }`}
                                      </span>
                                  </div>
                              </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-neonRed animate-ping"></div>
                                    Waiting for events stream...
                                </div>
                            </td>
                        </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </Card>
    </div>
  )
}

export default InfraSecurityPage
