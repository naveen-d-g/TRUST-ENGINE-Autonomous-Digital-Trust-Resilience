import { useParams, useNavigate } from "react-router-dom"
import { Card } from "@/components/cards/Card"
import { Button } from "@/components/buttons/Button"
import { Badge } from "@/components/badges/Badge"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { authStore } from "@/store/authStore"

import { CorrelationGraph } from "@/components/intelligence/CorrelationGraph"
import { CorrelationData } from "@/types/correlation"

import { IncidentCommandPanel } from "@/components/incidents/IncidentCommandPanel"

const IncidentDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const role = authStore(s => s.role) // RBAC Check

  const stages = ["OPEN", "CONTAINED", "RECOVERING", "RESOLVED"]
  const currentStage = "OPEN" // Would come from data

  // Mock Correlation Data
  const correlationData: CorrelationData = {
    nodes: [
        { id: "inc1", name: `Incident #${id}`, type: "INCIDENT", val: 20 },
        { id: "usr1", name: "User: admin", type: "USER", val: 5 },
        { id: "sess1", name: "Session: 8291", type: "SESSION", val: 10 },
        { id: "ip1", name: "192.168.1.44", type: "IP", val: 5 },
        { id: "ip2", name: "10.0.0.5", type: "IP", val: 5 }
    ],
    links: [
        { source: "inc1", target: "sess1" },
        { source: "sess1", target: "usr1" },
        { source: "sess1", target: "ip1" },
        { source: "sess1", target: "ip2" }
    ]
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between">
         <div className="flex items-center space-x-4">
           <Button variant="ghost" onClick={() => navigate(-1)}>
             <ArrowLeft className="w-4 h-4" />
           </Button>
           <h1 className="text-2xl font-bold text-white tracking-wide">Incident #{id}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-8">
            {/* Lifecycle Progress */}
            <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Incident Lifecycle</h3>
                <div className="flex gap-4">
                    {stages.map(stage => (
                        <div 
                            key={stage} 
                            className={`px-4 py-2 rounded text-xs font-bold border ${
                                stage === currentStage 
                                ? "bg-neonBlue/20 border-neonBlue text-neonBlue" 
                                : "bg-bgSecondary border-gray-700 text-gray-500"
                            }`}
                        >
                            {stage}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Incident Command Console Integration */}
            <div className="mt-6">
                <IncidentCommandPanel incidentId={id || ""} status={currentStage} role={role || "VIEWER"} />
            </div>
            
            <div className="mt-8">
                 <CorrelationGraph data={correlationData} />
            </div>

            <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Analysis Timeline</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-neonBlue mt-2"></div>
                                <div className="w-0.5 h-full bg-gray-800 my-1"></div>
                            </div>
                            <div className="pb-6">
                                <div className="text-sm text-gray-400">10:4{i}:00 AM</div>
                                <div className="text-white font-medium">Suspicious payload detected</div>
                                <div className="text-xs text-gray-500 mt-1">Source: WAF-01 | Confidence: 98%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>

        <div className="space-y-6">
            <Card>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Metadata</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Severity</span>
                        <Badge variant="danger" className="animate-pulse shadow-neon-red">CRITICAL</Badge>
                    </div>
                </div>
            </Card>

             <Card variant="danger" glow>
                <div className="flex items-center gap-3 text-neonRed mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-bold">AI Advisory</span>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                    Immediate containment required. Host isolation protocol suggested.
                </p>
            </Card>
        </div>
      </div>
    </div>
  )
}

export default IncidentDetailsPage;
