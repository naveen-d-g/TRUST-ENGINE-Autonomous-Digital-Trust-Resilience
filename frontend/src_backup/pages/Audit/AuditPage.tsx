import { Card } from "@/components/cards/Card"
import { ShieldCheck, User, AlertTriangle, CloudRain, Clock } from "lucide-react"

const AuditPage = () => {
  // Mock Audit Data
  const audits = [
      { id: "1", actor: "system", action: "Pattern Update: CVE-2024-1092", timestamp: "10 min ago", type: "system" },
      { id: "2", actor: "admin@soc.corp", action: "Containment: Session #88219", timestamp: "25 min ago", type: "critical" },
      { id: "3", actor: "analyst@soc.corp", action: "Review: Incident #442", timestamp: "1 hour ago", type: "user" },
      { id: "4", actor: "system", action: "Auto-Scale: Inference Nodes +2", timestamp: "2 hours ago", type: "system" },
  ]

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-white tracking-wide">Global Audit Timeline</h1>

       <Card>
           <div className="space-y-8 pl-4">
               {audits.map((audit, i) => (
                   <div key={audit.id} className="relative flex items-start gap-4">
                       {/* Line */}
                       {i < audits.length - 1 && (
                           <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-gray-800"></div>
                       )}
                       
                       <div className={`
                           relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 border-bgCard
                           ${audit.type === 'critical' ? 'bg-neonRed text-white' : 
                             audit.type === 'system' ? 'bg-neonBlue text-white' : 'bg-gray-700 text-gray-400'}
                       `}>
                           {audit.type === 'critical' ? <AlertTriangle className="w-3 h-3" /> :
                            audit.type === 'system' ? <CloudRain className="w-3 h-3" /> : <User className="w-3 h-3" />}
                       </div>

                       <div className="flex-1 pb-2">
                           <div className="flex justify-between items-start">
                               <div>
                                   <div className="font-bold text-white text-sm">{audit.action}</div>
                                   <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                       <ShieldCheck className="w-3 h-3" /> {audit.actor}
                                   </div>
                               </div>
                               <div className="flex items-center gap-1 text-xs text-gray-500">
                                   <Clock className="w-3 h-3" /> {audit.timestamp}
                               </div>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
       </Card>
    </div>
  )
}

export default AuditPage
