import { SystemHealthPanel } from "@/components/system/SystemHealthPanel"
import { Card } from "@/components/cards/Card"

const SystemHealthPage = () => {
  return (
    <div className="p-6 space-y-6 animate-in fade-in">
        <h1 className="text-2xl font-bold text-white tracking-wide">System Health Status</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemHealthPanel />
            
            <Card>
                <h3 className="text-gray-400 uppercase tracking-widest text-xs mb-4 font-bold">Infrastructure Metrics</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">CPU Usage</span>
                        <div className="w-48 h-2 bg-gray-800 rounded overflow-hidden">
                            <div className="h-full bg-neonBlue w-[45%]"></div>
                        </div>
                        <span className="text-white font-mono text-sm">45%</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-400">Memory Usage</span>
                        <div className="w-48 h-2 bg-gray-800 rounded overflow-hidden">
                            <div className="h-full bg-neonPurple w-[62%]"></div>
                        </div>
                        <span className="text-white font-mono text-sm">62%</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-400">Disk I/O</span>
                        <div className="w-48 h-2 bg-gray-800 rounded overflow-hidden">
                            <div className="h-full bg-neonGreen w-[20%]"></div>
                        </div>
                        <span className="text-white font-mono text-sm">20%</span>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  )
}

export default SystemHealthPage
