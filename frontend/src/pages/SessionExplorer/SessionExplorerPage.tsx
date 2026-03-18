import { useEffect, useState } from "react"
import { useSessionStore } from "@/store/sessionStore"
import { SessionExplorerTable } from "./components/SessionExplorerTable"
import { Search, RefreshCw, ChevronLeft, ChevronRight, Filter, Zap, Globe, Activity } from "lucide-react"

const SessionExplorerPage = () => {
  const { sessions, loading: isLoading, fetch: fetchSessions } = useSessionStore()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchSessions({ search: search || undefined })
    }, 400)
    return () => clearTimeout(timer)
  }, [search, fetchSessions])

  return (
    <div className="min-h-screen bg-slate-950 px-8 py-8">
      <div className="relative z-10 space-y-6 max-w-[1600px] mx-auto">
        {/* Premium Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-2">
          <div className="space-y-1 animate-in slide-in-from-left-4 duration-700">
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
              Session Explorer
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.1em]">
              Deep packet inspection & risk analysis
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 animate-in slide-in-from-right-4 duration-700">
            <div className="glass-card flex items-center gap-2 p-1.5 rounded-2xl glow-border-blue">
               <div className="p-2 bg-slate-900/50 rounded-xl text-slate-400">
                 <Filter size={14} />
               </div>
               <select 
                className="bg-transparent border-none py-1.5 px-3 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none cursor-pointer appearance-none min-w-[140px]"
                onChange={(e) => fetchSessions({ source: e.target.value || undefined })}
              >
                <option value="" className="bg-slate-900">Protocol: All</option>
                <option value="PROD" className="bg-slate-900">Source: Production</option>
                <option value="BATCH" className="bg-slate-900">Source: Batch Processing</option>
                <option value="DEMO" className="bg-slate-900">Source: Neural Sim</option>
              </select>
            </div>

            <div className="glass-card flex items-center gap-3 px-4 py-1.5 rounded-2xl glow-border-blue flex-1 md:min-w-[300px]">
              <Search className="w-4 h-4 text-primary animate-pulse" />
              <input 
                type="text" 
                placeholder="INITIALIZE SEARCH SEQUENCE..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none py-2 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-slate-600 focus:outline-none"
              />
            </div>

            <button 
              onClick={() => fetchSessions()}
              className="p-3.5 rounded-2xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary transition-all hover:scale-105 active:scale-95 shadow-lg group/refresh"
              title="Resynchronize Streams"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            </button>
          </div>
        </div>

        {/* Intelligence Statistics (Implicitly added for premium feel) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-1000 slide-in-from-bottom-4">
           {[
             { label: 'Active Streams', value: sessions.length, icon: Activity, color: 'text-primary' },
             { label: 'Neural Resolution', value: '4.0.8', icon: Zap, color: 'text-warning' },
             { label: 'Uptime Protocol', value: '99.9%', icon: Globe, color: 'text-success' },
             { label: 'Buffer State', value: 'Nominal', icon: RefreshCw, color: 'text-info' }
           ].map((stat, i) => (
             <div key={i} className="glass-card p-4 rounded-3xl glow-border-blue flex items-center gap-4 transition-all hover:bg-slate-900/40 group/stat">
               <div className={`p-3 bg-slate-950/50 rounded-2xl border border-white/5 transition-all group-hover/stat:scale-110 ${stat.color}`}>
                 <stat.icon size={18} />
               </div>
               <div>
                 <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                 <p className="text-base font-black text-white italic uppercase tracking-tighter">{stat.value}</p>
               </div>
             </div>
           ))}
        </div>

        <div className="animate-in fade-in zoom-in-95 duration-1000 delay-200">
          <SessionExplorerTable 
            data={sessions || []} 
            isLoading={isLoading}
          />
        </div>

        {/* Premium Pagination Controls */}
        <div className="flex justify-between items-center bg-slate-900/40 backdrop-blur-md p-4 rounded-[2rem] border border-white/5 shadow-2xl animate-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Matrix Synchronization Page: <span className="text-white italic">{page}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-3 rounded-xl bg-slate-950/50 border border-white/5 hover:border-primary/50 text-slate-500 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>
              
              <div className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl">
                 <span className="text-xs font-black text-primary italic px-2">{page}</span>
              </div>
              
              <button 
                 onClick={() => setPage(p => p + 1)}
                 className="p-3 rounded-xl bg-slate-950/50 border border-white/5 hover:border-primary/50 text-slate-500 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionExplorerPage
