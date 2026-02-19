import { Card } from "@/components/cards/Card"
import { ShieldAlert } from "lucide-react"

const SOCPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-neonRed">
        <ShieldAlert className="w-8 h-8" />
        <h1 className="text-2xl font-bold tracking-wide text-white">Security Operations Center</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="h-64 flex items-center justify-center border-dashed border-gray-700 bg-bgCard/30">
          <span className="text-gray-500 font-mono">INCIDENT FEED MAP</span>
        </Card>
        <Card className="h-64 flex items-center justify-center border-dashed border-gray-700 bg-bgCard/30">
          <span className="text-gray-500 font-mono">ACTIVE CONTAINMENT ZONES</span>
        </Card>
        <Card className="h-64 flex items-center justify-center border-dashed border-gray-700 bg-bgCard/30">
          <span className="text-gray-500 font-mono">THREAT INTELLIGENCE</span>
        </Card>
      </div>
      
      <div className="p-4 bg-neonRed/10 border border-neonRed/20 rounded-lg text-neonRed text-sm flex items-center justify-center animate-pulse">
        AWAITING LIVE STREAM INTEGRATION...
      </div>
    </div>
  )
}

export default SOCPage
