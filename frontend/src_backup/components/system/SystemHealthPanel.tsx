import { Activity, Database, Cloud, Wifi } from "lucide-react"
import { Card } from "@/components/cards/Card"
import { useSystemStore } from "@/store/domain/systemStore"
import { useEffect } from "react"

// Mock mapping for now, assuming store has these metrics
// Ideally store should calculate these or hold raw data
const mapMetrics = (metrics: { cpuUsage: number; diskIo: number; memoryUsage: number; }) => [
   { name: "API Gateway", status: "healthy", latency: metrics.cpuUsage * 2 + 20, icon: Cloud }, // Mock correlation
   { name: "Database (Primary)", status: "healthy", latency: metrics.diskIo * 0.5 + 5, icon: Database },
   { name: "Realtime Socket", status: "healthy", latency: metrics.memoryUsage * 1 + 10, icon: Wifi },
   { name: "ML Inference Engine", status: "healthy", latency: 230, icon: Activity },
]

export const SystemHealthPanel = () => {
    const { metrics, updateMetrics } = useSystemStore()
    
    // Simulate live data updates into the store
    useEffect(() => {
        const interval = setInterval(() => {
            updateMetrics({
                cpuUsage: Math.random() * 50 + 10,
                memoryUsage: Math.random() * 40 + 20,
                diskIo: Math.random() * 30,
                activeServices: 12
            })
        }, 3000)
        return () => clearInterval(interval)
    }, [updateMetrics])

    const displayMetrics = mapMetrics(metrics)

    return (
        <Card>
            <h3 className="text-gray-400 uppercase tracking-widest text-xs mb-4 font-bold">System Health Status</h3>
            <div className="space-y-4">
                {displayMetrics.map((m) => (
                    <div key={m.name} className="flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors">
                        <div className="flex items-center gap-3">
                            <m.icon className={`w-4 h-4 ${
                                m.status === "healthy" ? "text-neonGreen" : 
                                m.status === "degraded" ? "text-neonOrange" : "text-neonRed"
                            }`} />
                            <span className="text-sm text-gray-300 font-medium">{m.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                             <span className="text-xs font-mono text-gray-500">{m.latency.toFixed(0)}ms</span>
                             <div className={`w-2 h-2 rounded-full ${
                                 m.status === "healthy" ? "bg-neonGreen shadow-[0_0_8px_rgba(34,197,94,0.5)]" : 
                                 m.status === "degraded" ? "bg-neonOrange" : "bg-neonRed animate-pulse"
                             }`}></div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}
