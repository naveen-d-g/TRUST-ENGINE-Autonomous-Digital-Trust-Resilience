import { Bell, Search, User } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useNotificationStore } from "@/store/notificationStore"

export const Topbar = () => {
    const { user, logout } = useAuthStore()
    const { notifications } = useNotificationStore()

    return (
        <div className="h-16 border-b border-gray-800 bg-bgDark/50 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-1.5 w-96 transition-colors focus-within:border-neonBlue/50">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search incidents, IPs, or users... (Ctrl+K)" 
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-gray-600"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
                    <Bell className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                    {notifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neonRed rounded-full animate-pulse"></span>
                    )}
                </button>
                
                <div className="h-8 w-[1px] bg-gray-800 mx-2"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-white">{user?.username || "Analyst"}</div>
                        <div className="text-xs text-gray-500 font-mono">{user?.role || "GUEST"}</div>
                    </div>
                    <div 
                        onClick={logout}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-neonBlue to-purple-600 border border-white/10 flex items-center justify-center shadow-lg hover:shadow-neonBlue/20 transition-all cursor-pointer"
                        title="Logout"
                    >
                        <User className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>
        </div>
    )
}
