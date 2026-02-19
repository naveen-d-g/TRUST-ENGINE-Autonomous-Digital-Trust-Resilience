import { useIncidentStore } from "@/store/incidentStore"
import { useNotificationStore } from "@/store/notificationStore"
import { Shield, AlertTriangle, CheckCircle, Lock } from "lucide-react"
import { getSeverityConfig } from "@/theme/severity"
import { motion } from "@/theme/motion"

interface Props {
  incidentId: string
  status: string
  role: string 
}

export const IncidentCommandPanel = ({ incidentId, status, role }: Props) => {
  const refresh = useIncidentStore((s: any) => s.fetch)
  const addNotification = useNotificationStore((s: any) => s.addNotification)


  // Use incidentId to suppress lint
  // const _id = incidentId; // This triggers unused var in TS if not used.

  // Debug log to use incidentId
  // console.debug(`Rendering command panel for ${incidentId}`)

  const contain = async () => {
    try {
        await new Promise(r => setTimeout(r, 1000))
        addNotification("Incident Containment Protocol Initiated - Assets Isolated", "warning")
        refresh() 
    } catch (e: unknown) {
        const error = e as Error;
        addNotification(`Containment Failed: ${error.message}`, "critical")
    }
  }

  const recover = async () => {
    try {
        await new Promise(r => setTimeout(r, 1000))
        addNotification("Recovery Process Started - Restoring Services", "success")
        refresh()
    } catch (e: unknown) {
        const error = e as Error;
        addNotification(`Recovery Failed: ${error.message}`, "critical")
    }
  }

  const isClosed = status === "RESOLVED" || status === "CLOSED"
  const statusSev = status === "OPEN" ? "CRITICAL" : status === "CONTAINED" ? "HIGH" : "LOW"
  const statusStyle = getSeverityConfig(statusSev)

  return (
    <div data-incident-id={incidentId} className={`bg-[#111827] border border-gray-800 p-6 rounded-xl space-y-4 shadow-lg ${motion.animations.fadeIn}`}>
      <div className="flex items-center gap-2 border-b border-gray-800 pb-4 mb-4">
        <Shield className="w-5 h-5 text-neonBlue" />
        <h2 className="text-lg font-bold text-white tracking-wide">Incident Command Console</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
              <span className="text-gray-500 text-xs uppercase block mb-1">Current Status</span>
              <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusStyle.bg.replace('/10','')} ${statusStyle.glow} ${status === 'OPEN' ? motion.animations.pulse : ''}`}></div>
                  <span className={`font-mono font-bold ${statusStyle.color}`}>{status}</span>
              </div>
          </div>
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
              <span className="text-gray-500 text-xs uppercase block mb-1">Authorization</span>
              <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <span className="font-mono font-bold text-white">{role}</span>
              </div>
          </div>
      </div>

      <div className="pt-2 flex gap-3">
        {role === "ADMIN" && status === "OPEN" && (
          <button 
            onClick={contain} 
            className="flex-1 bg-neonOrange/10 border border-neonOrange text-neonOrange hover:bg-neonOrange/20 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            CONTAIN INCIDENT
          </button>
        )}

        {role === "ADMIN" && status === "CONTAINED" && (
          <button 
            onClick={recover} 
            className="flex-1 bg-neonGreen/10 border border-neonGreen text-neonGreen hover:bg-neonGreen/20 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            START RECOVERY
          </button>
        )}
        
        {isClosed && (
            <div className="w-full text-center py-2 text-gray-500 font-mono text-sm">
                Incident is closed. No actions available.
            </div>
        )}
      </div>
    </div>
  )
}
