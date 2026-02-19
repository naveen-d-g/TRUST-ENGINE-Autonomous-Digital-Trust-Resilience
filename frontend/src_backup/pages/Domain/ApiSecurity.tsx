import { Card } from "@/components/cards/Card"
import { Server } from "lucide-react"

const ApiSecurityPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-neonPurple">
        <Server className="w-8 h-8" />
        <h1 className="text-2xl font-bold tracking-wide text-white">Domain: API Security</h1>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-64 flex items-center justify-center border-dashed border-gray-700 bg-bgCard/30">
          <span className="text-gray-500 font-mono">TOKEN LEAKAGE MONITOR</span>
        </Card>
        <Card className="h-64 flex items-center justify-center border-dashed border-gray-700 bg-bgCard/30">
          <span className="text-gray-500 font-mono">RATE LIMIT ANOMALIES</span>
        </Card>
      </div>
    </div>
  )
}

export default ApiSecurityPage
