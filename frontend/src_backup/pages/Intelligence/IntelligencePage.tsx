import { ThreatHeatmap } from "@/components/intelligence/ThreatHeatmap"
import { Card } from "@/components/cards/Card"

// Mock Data
const heatmapData = [
  { region: "North America", risk: 85 },
  { region: "Europe", risk: 45 },
  { region: "Asia Pacific", risk: 65 },
  { region: "South America", risk: 30 },
  { region: "Africa", risk: 25 },
  { region: "Middle East", risk: 75 },
  { region: "Antarctica", risk: 5 },
  { region: "Oceania", risk: 20 }
]

const IntelligencePage = () => {
  return (
    <div className="p-6 space-y-6 animate-in fade-in">
        <h1 className="text-2xl font-bold text-white tracking-wide">Global Threat Intelligence</h1>
        
        <Card>
            <h3 className="text-gray-400 uppercase tracking-widest text-xs mb-6 font-bold">Real-time Threat Heatmap</h3>
            <ThreatHeatmap data={heatmapData} />
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h3 className="text-gray-400 uppercase tracking-widest text-xs mb-4 font-bold">Top Threat Actors</h3>
                <div className="space-y-4">
                    {["APT-29", "Lazarus Group", "Unknown-88"].map(actor => (
                        <div key={actor} className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                            <span className="text-neonRed font-mono">{actor}</span>
                            <span className="text-xs text-gray-500">High Confidence</span>
                        </div>
                    ))}
                </div>
            </Card>
            <Card>
                <h3 className="text-gray-400 uppercase tracking-widest text-xs mb-4 font-bold">Vulnerability Feed</h3>
                 <div className="space-y-4">
                    {["CVE-2024-3094", "CVE-2024-1002"].map(cve => (
                        <div key={cve} className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                            <span className="text-neonOrange font-mono">{cve}</span>
                            <span className="text-xs text-gray-500">Patched</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
  )
}

export default IntelligencePage
