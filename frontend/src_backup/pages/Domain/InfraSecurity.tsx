import { Card } from "@/components/cards/Card"
import { Database } from "lucide-react"

const InfraSecurityPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-neonRed">
        <Database className="w-8 h-8" />
        <h1 className="text-2xl font-bold tracking-wide text-white">Domain: Infra Security</h1>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-64 flex items-center justify-center border-dashed border-gray-700 bg-bgCard/30">
          <span className="text-gray-500 font-mono">KUBERNETES CONFIG AUDIT</span>
        </Card>
        <Card className="h-64 flex items-center justify-center border-dashed border-gray-700 bg-bgCard/30">
          <span className="text-gray-500 font-mono">IAM PRIVILEGE ESCALATION</span>
        </Card>
      </div>
    </div>
  )
}

export default InfraSecurityPage
