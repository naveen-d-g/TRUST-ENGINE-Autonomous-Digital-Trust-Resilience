import { useNotificationStore } from "@/store/notificationStore"
import { X, CheckCircle, AlertTriangle, AlertOctagon, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export const ToastContainer = () => {
    const { notifications, remove } = useNotificationStore()

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {notifications.map((n) => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        layout
                        className="pointer-events-auto min-w-[300px] max-w-sm bg-[#111827] border border-gray-800 shadow-2xl rounded-lg overflow-hidden flex"
                    >
                         <div className={`w-1 ${
                             n.type === "success" ? "bg-neonGreen" :
                             n.type === "warning" ? "bg-neonOrange" :
                             n.type === "critical" ? "bg-neonRed" : "bg-neonBlue"
                         }`}></div>
                         
                         <div className="p-3 flex items-start gap-3 flex-1">
                             {n.type === "success" && <CheckCircle className="w-5 h-5 text-neonGreen shrink-0" />}
                             {n.type === "warning" && <AlertTriangle className="w-5 h-5 text-neonOrange shrink-0" />}
                             {n.type === "critical" && <AlertOctagon className="w-5 h-5 text-neonRed shrink-0" />}
                             {n.type === "info" && <Info className="w-5 h-5 text-neonBlue shrink-0" />}
                             
                             <div className="flex-1">
                                 <p className="text-sm font-medium text-white">{n.message}</p>
                                 <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleTimeString()}</p>
                             </div>

                             <button 
                                onClick={() => remove(n.id)}
                                className="text-gray-500 hover:text-white transition-colors"
                             >
                                 <X className="w-4 h-4" />
                             </button>
                         </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
