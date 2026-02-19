import { useEffect, useState } from "react"
import { sessionStore } from "@/store/sessionStore"
import { DataTable } from "@/components/tables/DataTable"
import { SessionModel } from "@/types/models"
import { Badge } from "@/components/badges/Badge"
import { Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"

const SessionExplorerPage = () => {
  const { sessions, isLoading, fetchSessions } = sessionStore()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchSessions(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search, fetchSessions])

  // Map sessions to have an 'id' field for DataTable compatibility
  const mappedSessions = sessions.map(s => ({ ...s, id: s.session_id }))

  const columns = [
    {
      header: "Session ID",
      accessorKey: "session_id" as keyof SessionModel,
      cell: (item: SessionModel) => (
        <span className="font-mono text-neonBlue text-xs">{item.session_id?.substring(0, 8)}...</span>
      ),
    },
    {
      header: "User ID",
      accessorKey: "user_id" as keyof SessionModel,
      cell: (item: SessionModel) => <span className="font-medium text-white">{item.user_id}</span>,
    },
    {
      header: "Risk Score",
      accessorKey: "risk_score" as keyof SessionModel,
      cell: (item: SessionModel) => {
        const trust = 100 - item.risk_score // Assuming risk_score is 0-100 where higher is worse
        return <span className={`font-bold ${
            trust > 80 ? "text-neonGreen" : trust > 50 ? "text-neonOrange" : "text-neonRed"
        }`}>{item.risk_score.toFixed(0)}</span>
      },
    },
    {
      header: "Label",
      accessorKey: "label" as keyof SessionModel,
      cell: (item: SessionModel) => (
        <Badge variant={
            item.label === "MALICIOUS" ? "danger" : 
            item.label === "SUSPICIOUS" ? "warning" : "success"
        }>
            {item.label}
        </Badge>
      )
    },
    {
      header: "Events",
      accessorKey: "event_count" as keyof SessionModel,
      cell: (item: SessionModel) => <span className="text-gray-400">{item.event_count || 0}</span>
    },
    {
      header: "Last Seen",
      accessorKey: "last_seen" as keyof SessionModel,
      cell: (item: SessionModel) => <span className="text-gray-500 text-xs">{new Date(item.last_seen || Date.now()).toLocaleTimeString()}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-white tracking-wide">Session Explorer</h1>
           <p className="text-gray-400 text-sm mt-1">Deep packet inspection & risk analysis</p>
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search user or session..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bgSecondary border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-neonBlue transition-colors"
            />
          </div>
          <button 
            onClick={() => fetchSessions(search)}
            className="p-2 rounded-lg bg-bgList hover:bg-gray-800 text-gray-400 hover:text-white transition-colors border border-gray-700"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <DataTable 
        data={mappedSessions as any} 
        columns={columns as any} 
        isLoading={isLoading}
      />

      {/* Pagination Controls */}
      <div className="flex justify-end items-center gap-4">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-2 rounded hover:bg-white/5 disabled:opacity-50"
          >
              <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-400">Page {page}</span>
          <button 
             onClick={() => setPage(p => p + 1)}
             className="p-2 rounded hover:bg-white/5 disabled:opacity-50"
          >
              <ChevronRight className="w-4 h-4" />
          </button>
      </div>
    </div>
  )
}

export default SessionExplorerPage
