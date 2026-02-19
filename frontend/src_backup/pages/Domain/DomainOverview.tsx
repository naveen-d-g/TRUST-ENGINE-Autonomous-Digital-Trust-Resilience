import { Card } from "@/components/cards/Card"
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard"
import { useDashboardStore } from "@/store/dashboardStore"
import { Globe, Server, Network } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

const DomainOverviewPage = () => {
  const { metrics } = useDashboardStore()
  useRealtimeDashboard()

  const data = metrics ? [
      { name: 'Web', value: metrics.domain_risk.web },
      { name: 'API', value: metrics.domain_risk.api },
      { name: 'Network', value: metrics.domain_risk.network },
      { name: 'Infra', value: metrics.domain_risk.infra },
  ] : []

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white tracking-wide">Multi-Domain Intelligence</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-80">
                <h3 className="text-white font-bold mb-4">Risk Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                            itemStyle={{ color: '#F3F4F6' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={
                                    entry.value > 80 ? '#EF4444' :
                                    entry.value > 50 ? '#F59E0B' : '#3B82F6'
                                } />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            <Card className="space-y-4">
                <h3 className="text-white font-bold mb-4">Domain Health Status</h3>
                
                <div className="flex items-center justify-between p-4 bg-bgSecondary rounded-lg border-l-4 border-neonBlue">
                    <div className="flex items-center gap-3">
                        <Globe className="text-neonBlue" />
                        <div>
                            <div className="font-bold text-white">Web Security</div>
                            <div className="text-xs text-gray-400">WAF Active • 98% Traffic Clean</div>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{metrics?.domain_risk.web || 0}%</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-bgSecondary rounded-lg border-l-4 border-neonPurple">
                    <div className="flex items-center gap-3">
                        <Server className="text-neonPurple" />
                        <div>
                            <div className="font-bold text-white">API Security</div>
                            <div className="text-xs text-gray-400">Schema Validation Enforced</div>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{metrics?.domain_risk.api || 0}%</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-bgSecondary rounded-lg border-l-4 border-neonOrange">
                    <div className="flex items-center gap-3">
                        <Network className="text-neonOrange" />
                        <div>
                            <div className="font-bold text-white">Network Security</div>
                            <div className="text-xs text-gray-400">Micro-segmentation Active</div>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{metrics?.domain_risk.network || 0}%</div>
                </div>
            </Card>
        </div>
    </div>
  )
}

export default DomainOverviewPage
