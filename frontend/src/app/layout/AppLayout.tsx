import { useState, useRef, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { useNotificationStore } from "@/store/notificationStore"
import { useAuthStore } from "@/store/authStore"
import { useMonitoringStore } from "@/store/monitoringStore"
import { Shield, AlertCircle, CheckCircle, Info, XCircle, Bell, Settings, User as UserIcon, LogOut, ChevronDown } from "lucide-react"

const Topbar = ({ onToggleNotifications }: { onToggleNotifications: () => void }) => {
    const { user, logout } = useAuthStore()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header className="h-16 border-b border-gray-800/40 bg-[#0A0E14]/80 flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Shield className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-[11px] font-black text-white/80 uppercase tracking-[0.3em]">Digital Trust Dashboard</span>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex items-center gap-6 text-gray-400">
                    <div className="relative group cursor-pointer" onClick={onToggleNotifications}>
                        <Bell className="w-4 h-4 group-hover:text-white transition-colors" />
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#0A0E14] shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
                    </div>
                    <Settings className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                </div>
                
                <div className="relative" ref={menuRef}>
                    <div 
                        className="flex items-center gap-4 pl-6 border-l border-gray-800/60 cursor-pointer group"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate max-w-[150px]">
                                {user?.email || "ADMIN@TRUSTENGINE.AI"}
                            </span>
                            <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest leading-none mt-1">
                                {user?.role || "Admin"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gray-800/40 border border-gray-700/60 flex items-center justify-center group-hover:bg-gray-800/60 transition-all">
                                <UserIcon className="w-4 h-4 text-gray-300" />
                            </div>
                            <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-[#0A0D14] border border-gray-800/60 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden py-2 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-gray-800/60 bg-white/[0.02]">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</div>
                                <div className="text-xs font-black text-white truncate">{user?.email || "admin@trustengine.ai"}</div>
                            </div>
                            <div className="p-2">
                                <button 
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Terminal Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

const NotificationToast = () => {
    const notifications = useNotificationStore(state => state.notifications)
    const removeNotification = useNotificationStore(state => state.removeNotification)

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {notifications.map((note) => (
                <div
                    key={note.id}
                    className="bg-[#0A0E14] border border-gray-700 shadow-xl rounded-lg p-4 w-80 animate-in slide-in-from-right fade-in flex items-start gap-3"
                >
                    {note.severity === "success" && <CheckCircle className="text-emerald-500 w-5 h-5" />}
                    {note.severity === "error" && <XCircle className="text-red-500 w-5 h-5" />}
                    {note.severity === "warning" && <AlertCircle className="text-amber-500 w-5 h-5" />}
                    {note.severity === "info" && <Info className="text-blue-500 w-5 h-5" />}
                    
                    <div className="flex-1 text-sm text-gray-200">{note.message}</div>
                    <button onClick={() => removeNotification(note.id)} className="text-gray-500 hover:text-white">✕</button>
                </div>
            ))}
        </div>
    )
}

const NotificationSidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const monitoringStore = useMonitoringStore()
    
    // Aggregating all domains safely
    const allEvents = [
        ...(monitoringStore.web?.events || []),
        ...(monitoringStore.api?.events || []),
        ...(monitoringStore.network?.events || []),
        ...(monitoringStore.system?.events || [])
    ]

    // Filter for critical/warning risk attacks safely
    const criticalAttacks = allEvents
        .filter(event => event && (event.decision === 'RESTRICT' || event.decision === 'ESCALATE' || (event.riskScore && event.riskScore >= 70)))
        .sort((a, b) => {
            const timeA = (a && a.timestamp) ? new Date(a.timestamp).getTime() : 0;
            const timeB = (b && b.timestamp) ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA;
        })
        .slice(0, 50)

    if (!isOpen) return null;

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" 
                onClick={onClose}
            />
            <div className="fixed inset-y-0 right-0 w-96 bg-[#0A0D14] border-l border-gray-800/60 shadow-[[-20px_0_50px_rgba(0,0,0,0.5)]] transform transition-transform duration-300 z-[101] flex flex-col animate-in slide-in-from-right fade-in">
                <div className="flex items-center justify-between p-6 border-b border-gray-800/60 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Active Threats</h2>
                        <span className="bg-red-500/20 text-red-400 text-[9px] font-black px-2 py-0.5 rounded-full">{criticalAttacks.length}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                    {criticalAttacks.length === 0 ? (
                        <div className="text-center text-gray-500 text-[10px] py-10 font-bold uppercase tracking-widest">
                            No Critical Threats Detected
                        </div>
                    ) : (
                        criticalAttacks.map((attack, idx) => (
                            <div key={`${attack.id}-${idx}`} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${attack.decision === 'ESCALATE' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-500'}`}>
                                        {attack.decision || 'UNKNOWN'}
                                    </span>
                                    <span className="text-[9px] font-bold text-gray-500 tracking-wider">
                                        {attack.timestamp ? new Date(attack.timestamp).toLocaleTimeString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="text-xs font-black text-white mb-2 tracking-wide uppercase group-hover:text-red-400 transition-colors">
                                    {attack.domain || 'SYSTEM'} Trigger
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[10px] bg-black/40 px-2 py-1.5 rounded border border-white/5">
                                        <span className="text-gray-500 font-bold">SOURCE IP</span>
                                        <span className="text-gray-300 font-mono tracking-wider">{attack.ip}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] bg-black/40 px-2 py-1.5 rounded border border-white/5">
                                        <span className="text-gray-500 font-bold">RISK SCORE</span>
                                        <span className={`${Number(attack.riskScore || 0) >= 85 ? 'text-red-400' : 'text-amber-400'} font-black`}>{Number(attack.riskScore || 0).toFixed(0)}%</span>
                                    </div>
                                    {(attack.route || attack.type) && (
                                        <div className="flex items-center justify-between text-[10px] bg-black/40 px-2 py-1.5 rounded border border-white/5">
                                            <span className="text-gray-500 font-bold">VECTOR</span>
                                            <span className="text-gray-300 truncate max-w-[150px]">{attack.route || attack.type}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#05080D] text-gray-100 flex overflow-hidden w-screen">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Topbar onToggleNotifications={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <NotificationSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <NotificationToast />
    </div>
  )
}
