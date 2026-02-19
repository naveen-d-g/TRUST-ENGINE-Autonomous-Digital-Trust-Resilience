import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { useNotificationStore } from "@/store/notificationStore"
import { useAuthStore } from "@/store/authStore"
import { Shield, AlertCircle, CheckCircle, Info, XCircle, Sun, Bell, Settings, User as UserIcon } from "lucide-react"

const Topbar = () => {
    const user = useAuthStore(state => state.user)

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
                    <Sun className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                    <div className="relative">
                        <Bell className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-[#0A0E14] shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    </div>
                    <Settings className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                </div>
                
                <div className="flex items-center gap-4 pl-6 border-l border-gray-800/60">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate max-w-[150px]">
                            {user?.email || "dghere@admin"}
                        </span>
                        <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest leading-none">
                            {user?.role || "Admin"}
                        </span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-gray-800/40 border border-gray-700/60 flex items-center justify-center cursor-pointer hover:bg-gray-800/60 transition-all">
                        <UserIcon className="w-4 h-4 text-gray-300" />
                    </div>
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

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#05080D] text-gray-100 flex overflow-hidden w-screen">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <NotificationToast />
    </div>
  )
}
