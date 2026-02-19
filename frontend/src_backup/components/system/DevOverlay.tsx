import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { authStore } from "@/store/authStore"
import socketService from "@/services/socket"
import { useTenantStore } from "@/store/tenantStore"
import { featureFlags } from "@/core/featureFlags"

export const DevOverlay = () => {
    const [visible, setVisible] = useState(false)
    const location = useLocation()
    const { role, token } = authStore()
    const tenantId = useTenantStore(s => s.currentTenantId)
    const [socketConnected, setSocketConnected] = useState(false)

    useEffect(() => {
        const toggle = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === "D") {
                setVisible(prev => !prev)
            }
        }
        window.addEventListener("keydown", toggle)
        
        const checkSocket = setInterval(() => {
            setSocketConnected(socketService.socket?.connected ?? false)
        }, 1000)

        return () => {
            window.removeEventListener("keydown", toggle)
            clearInterval(checkSocket)
        }
    }, [])

    if (!visible) return null

    return (
        <div className="fixed bottom-4 right-4 bg-black/90 border border-neonBlue rounded p-4 shadow-xl z-50 text-xs font-mono text-neonBlue w-80">
            <h3 className="font-bold border-b border-gray-700 pb-2 mb-2 flex justify-between">
                <span>SYSTEM OBSERVABILITY</span>
                <span className="text-gray-500 text-[10px]">Ctrl+Shift+D</span>
            </h3>
            
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-400">Route:</span>
                    <span className="text-white truncate max-w-[150px]">{location.pathname}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-gray-400">Role:</span>
                    <span className={role === "ADMIN" ? "text-neonRed" : "text-neonGreen"}>{role || "GUEST"}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Tenant:</span>
                    <span className="text-white">{tenantId}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-gray-400">Socket:</span>
                    <span className={socketConnected ? "text-neonGreen" : "text-neonRed"}>
                        {socketConnected ? "CONNECTED" : "DISCONNECTED"}
                    </span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-gray-400">Auth Token:</span>
                    <span className="text-gray-600 truncate max-w-[100px]">{token ? "Valid" : "None"}</span>
                </div>
                
                <div className="pt-2 border-t border-gray-700 mt-2">
                    <div className="text-gray-500 mb-1">Feature Flags</div>
                    <div className="grid grid-cols-2 gap-1">
                        {Object.entries(featureFlags).map(([key, enabled]) => (
                            <div key={key} className={`text-[10px] ${enabled ? "text-neonGreen" : "text-gray-600"}`}>
                                {key.replace("ENABLE_", "")}: {enabled ? "ON" : "OFF"}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
