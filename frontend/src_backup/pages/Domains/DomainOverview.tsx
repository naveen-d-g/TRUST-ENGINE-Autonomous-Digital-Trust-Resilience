import { useParams } from "react-router-dom"
import { useWebStore } from "@/store/domain/webStore"
import { useApiStore } from "@/store/domain/apiStore"
import { useNetworkStore } from "@/store/domain/networkStore"
import { useSystemStore } from "@/store/domain/systemStore"
import { Card } from "@/components/cards/Card"
import { ThreatHeatmap } from "@/components/intelligence/ThreatHeatmap"

interface DomainData {
  metrics: Record<string, unknown>
  riskScore: number
  status: "healthy" | "degraded" | "critical"
  type: string
}

const OverviewLayout = ({ data }: { data: DomainData }) => {
  const { metrics, riskScore, status, type } = data

  const heatmapData = [
      { region: "US-East", risk: riskScore + 10 },
      { region: "EU-West", risk: Math.max(0, riskScore - 20) },
      { region: "AP-South", risk: riskScore },
      { region: "SA-East", risk: Math.max(0, riskScore - 10) }
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase">{type} Domain Security</h1>
          <div className={`px-4 py-1 rounded-full text-sm font-bold ${
              status === "healthy" ? "bg-neonGreen/10 text-neonGreen" : 
              status === "degraded" ? "bg-neonOrange/10 text-neonOrange" : "bg-neonRed/10 text-neonRed"
          }`}>
              {status}
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(metrics).map(([key, value]) => (
              <Card key={key} className="flex flex-col items-center justify-center p-6 bg-gray-900/50">
                  <span className="text-gray-400 text-xs uppercase tracking-widest mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-2xl font-bold text-white font-mono">{Number(value).toLocaleString()}</span>
              </Card>
          ))}
          <Card className="flex flex-col items-center justify-center p-6 bg-gray-900/50 border-neonBlue/30">
               <span className="text-neonBlue text-xs uppercase tracking-widest mb-2">Total Risk Score</span>
               <span className="text-3xl font-bold text-neonBlue font-mono">{riskScore}</span>
          </Card>
      </div>

      <Card>
          <h3 className="text-gray-400 uppercase tracking-widest text-xs mb-6 font-bold">Global Threat Heatmap</h3>
          <ThreatHeatmap data={heatmapData} />
      </Card>
    </div>
  )
}

const WebOverview = () => {
    const store = useWebStore()
    return <OverviewLayout data={{ ...store, type: 'web', metrics: store.metrics as unknown as Record<string, unknown> }} />
}

const ApiOverview = () => {
    const store = useApiStore()
    return <OverviewLayout data={{ ...store, type: 'api', metrics: store.metrics as unknown as Record<string, unknown> }} />
}

const NetworkOverview = () => {
    const store = useNetworkStore()
    return <OverviewLayout data={{ ...store, type: 'network', metrics: store.metrics as unknown as Record<string, unknown> }} />
}

const SystemOverview = () => {
    const store = useSystemStore()
    return <OverviewLayout data={{ ...store, type: 'system', metrics: store.metrics as unknown as Record<string, unknown> }} />
}

export const DomainOverview = () => {
  const { type } = useParams<{ type: string }>()
  
  switch(type) {
      case 'web': return <WebOverview />
      case 'api': return <ApiOverview />
      case 'network': return <NetworkOverview />
      case 'system': return <SystemOverview />
      default: return <WebOverview />
  }
}

export default DomainOverview
