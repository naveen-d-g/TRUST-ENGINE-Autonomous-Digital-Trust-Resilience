import { Card } from "@/components/cards/Card"
import { Globe } from "lucide-react"

const WebSecurityPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-neonBlue">
        <Globe className="w-8 h-8" />
        <h1 className="text-2xl font-bold tracking-wide text-white">Domain: Web Security</h1>
      </div>

       <div className="grid grid-cols-1 gap-6">
        <Card className="h-96 flex items-center justify-center border-dashed border-gray-700 bg-bgCard/30">
          <span className="text-gray-500 font-mono">WAF TELEMETRY & DDOS MITIGATION VISUALIZER</span>
        </Card>
      </div>
    </div>
  )
}

export default WebSecurityPage
