import { useState, useRef, useEffect } from "react"
import { Bell, Search, LogOut, ChevronDown } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useNotificationStore } from "@/store/notificationStore"

export const Topbar = () => {
    const { user, logout } = useAuthStore()
    const { notifications } = useNotificationStore()
    
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
        <div className="h-16 border-b border-gray-800 bg-bgDark/50 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-50">
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

                <div className="relative" ref={menuRef}>
                    <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <div className="text-right hidden md:block">
                            <div className="text-[10px] font-black text-white uppercase tracking-tighter">{user?.email || "ADMIN@TRUSTENGINE.AI"}</div>
                            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest italic">{user?.role || "ADMIN"}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-neonBlue to-purple-600 border border-white/10 flex items-center justify-center shadow-lg group-hover:shadow-neonBlue/20 transition-all"
                            >
                                <span className="text-xs font-black text-white leading-none">V</span>
                            </div>
                            <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="fixed right-6 top-[72px] w-64 bg-[#0A0D14] border border-gray-800/60 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden py-2 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-gray-800/60 bg-white/[0.02]">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</div>
                                <div className="text-xs font-black text-white truncate">{user?.email || user?.username || "admin@trustengine.ai"}</div>
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
        </div>
    )
}
