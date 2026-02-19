import { useState } from "react"
import { Card } from "@/components/cards/Card"
import { Button } from "@/components/buttons/Button"
import { DataTable } from "@/components/ui/DataTable" // Phase 8 Component
import { Search, Download, Calendar } from "lucide-react"

// Mock Data for Audit
interface AuditLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    resource: string;
    status: string;
    ip: string;
}

const MOCK_LOGS: AuditLog[] = Array.from({ length: 50 }).map((_, i) => ({
    id: `log-${i}`,
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
    user: i % 3 === 0 ? "admin@trustengine.ai" : "system",
    action: i % 5 === 0 ? "CONTAIN_INCIDENT" : "VIEW_SESSION",
    resource: i % 5 === 0 ? "incident-123" : `session-88${i}`,
    status: "SUCCESS",
    ip: "10.0.0.5"
}))

const AuditExplorer = () => {
  const [searchTerm, setSearchTerm] = useState("")
  
  const columns = [
      { key: "timestamp", header: "Time", render: (item: AuditLog) => <span className="font-mono text-xs text-gray-400">{item.timestamp}</span> },
      { key: "user", header: "Actor", render: (item: AuditLog) => <span className="text-neonBlue">{item.user}</span> },
      { key: "action", header: "Action", render: (item: AuditLog) => <span className="font-bold text-white">{item.action}</span> },
      { key: "resource", header: "Resource" },
      { key: "ip", header: "IP Address", render: (item: AuditLog) => <span className="font-mono text-xs">{item.ip}</span> },
      { key: "status", header: "Status", render: (item: AuditLog) => (
          <span className={item.status === "SUCCESS" ? "text-neonGreen" : "text-neonRed"}>{item.status}</span>
      )}
  ]

  const filtered = MOCK_LOGS.filter(l => 
      l.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.action.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white tracking-wide">Audit Log Explorer</h1>
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Export CSV
            </Button>
        </div>

        <Card>
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search logs by actor, action, or resource ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0B1120] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:border-neonBlue focus:outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 bg-[#0B1120] border border-gray-700 rounded-lg px-4 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Last 24 Hours</span>
                </div>
            </div>

            <DataTable<AuditLog> data={filtered} columns={columns} />
        </Card>
    </div>
  )
}

export default AuditExplorer
