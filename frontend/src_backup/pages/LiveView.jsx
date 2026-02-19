import React, { useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, CheckCircle, Activity, 
  Terminal, Play, Pause, ExternalLink, Zap
} from "lucide-react";
import { useLiveContext } from "../context/LiveContext";

const LiveView = () => {
    const navigate = useNavigate();
    const bottomRef = useRef(null);
    
    // Consume Global Live Context
    const { events, stats, alert, error, isPaused, togglePause } = useLiveContext();

    // Removed auto-scroll logic as requested (Newest events will appear at the top)

    const getRiskColor = (event) => {
        // 1. Check Explicit Severity (common in normalized events)
        if (event.severity) {
            if (event.severity === 'critical' || event.severity === 'high') return "text-red-500";
            if (event.severity === 'medium') return "text-amber-500";
            if (event.severity === 'low') return "text-blue-400";
            return "text-emerald-500";
        }
        
        // 2. Fallback to Status Code (HTTP/API)
        const status = event.status_code || event.raw_features?.status_code;
        if (status >= 500) return "text-red-500";
        if (status === 404 || status === 403) return "text-amber-500";
        if (status === 429) return "text-purple-500";
        return "text-emerald-500";
    };

    const getRiskIcon = (event) => {
        if (event.severity) {
             if (event.severity === 'critical' || event.severity === 'high') return <AlertTriangle className="w-4 h-4" />;
             if (event.severity === 'medium') return <Activity className="w-4 h-4" />;
             return <CheckCircle className="w-4 h-4" />;
        }

        const status = event.status_code || event.raw_features?.status_code;
        if (status >= 500 || status === 429) return <AlertTriangle className="w-4 h-4" />;
        if (status >= 400) return <Activity className="w-4 h-4" />;
        return <CheckCircle className="w-4 h-4" />;
    };

    const getEventDetails = (evt) => {
        const feat = evt.raw_features || evt.features || {};
        
        if (evt.event_type === 'infra') {
            return {
                method: "INFRA",
                path: `CPU: ${feat.cpu_load ?? 'N/A '}% | MEM: ${feat.mem_usage ?? 'N/A'}% | DISK: ${feat.disk_usage ?? 'N/A'}%`,
                color: "bg-blue-500/10 text-blue-500"
            };
        }
        if (evt.event_type === 'network') {
            return {
                method: `NET:${feat.scan_type || 'SCAN'}`,
                path: `Target: ${feat.target} | Open Ports: ${feat.open_port_count}`,
                color: "bg-purple-500/10 text-purple-500"
            };
        }
        
        // Default (HTTP/API)
        const method = feat.method || "UNK";
        const path = feat.path || feat.endpoint || "Unknown Path";
        
        let color = "bg-muted/20 text-foreground";
        if (method === 'DELETE') color = "bg-red-500/10 text-red-500";
        if (method === 'POST') color = "bg-emerald-500/10 text-emerald-500";
        
        return { method, path, color };
    };

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col fade-in">
            {/* Header */}
            <div className="flex justify-between items-center bg-card p-6 rounded-xl border border-border shrink-0">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-3">
                        <Terminal className="w-6 h-6 text-foreground" />
                        Live Threat Stream
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Real-time ingestion pipeline monitoring.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Active Sessions</span>
                        <span className="text-2xl font-mono font-bold text-foreground">{stats.active_sessions}</span>
                    </div>
                    <button 
                        onClick={togglePause}
                        className={`p-3 rounded-full border ${!isPaused ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-500'} transition-all`}
                    >
                        {!isPaused ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Predictive Alert Banner */}
            {alert && (
                 <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-center gap-4 animate-pulse shrink-0">
                     <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
                     <div className="flex-1">
                         <h3 className="font-bold text-red-400 text-lg">PREDICTIVE INTERVENTION TRIGGERED</h3>
                         <p className="text-red-200">{alert.message}</p>
                     </div>
                     <div className="text-right">
                         <div className="text-xs text-red-400 uppercase">Estimated Exploitation</div>
                         <div className="text-2xl font-mono font-bold text-red-500">{alert.timer}</div>
                     </div>
                     <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold">
                         BLOCK NOW
                     </button>
                 </div>
            )}

            {/* Terminal Feed */}
            <div className="flex-1 bg-black/90 rounded-xl border border-border shadow-inner overflow-hidden flex flex-col font-mono relative">
                 {/* Status Bar */}
                <div className="bg-muted/20 border-b border-border/20 px-4 py-2 flex justify-between items-center text-xs text-muted-foreground">
                    <span>STATUS: {error ? "OFFLINE" : "CONNECTED"}</span>
                    <span>SOURCE: gateway-primary</span>
                    <span>PROTOCOL: HTTP/2</span>
                </div>
                
                {/* Events Log - Newest at Top */}
                <div 
                    className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar"
                >
                    {events.length === 0 && !error && (
                         <div className="flex items-center justify-center h-full text-muted-foreground animate-pulse">
                             Waiting for telemetry events...
                         </div>
                    )}
                     {error && (
                         <div className="flex items-center justify-center h-full text-red-500 font-bold">
                             {error}
                         </div>
                    )}
                    
                    {events.map((evt, idx) => {
                        const details = getEventDetails(evt);
                        return (
                        <div key={evt.event_id || idx} className="grid grid-cols-12 gap-2 text-sm items-center hover:bg-white/5 p-1 rounded transition-colors group">
                             <div className="col-span-2 text-muted-foreground text-xs">
                                {new Date(evt.timestamp_epoch * 1000).toLocaleTimeString()}
                             </div>
                             <div className="col-span-1">
                                <span className={`flex items-center gap-1 ${getRiskColor(evt)}`}>
                                    {getRiskIcon(evt)}
                                </span>
                             </div>
                             <div className="col-span-2">
                                 <span className={`text-xs font-bold px-1.5 py-0.5 rounded border border-border ${details.color}`}>
                                     {details.method}
                                 </span>
                             </div>
                             <div className="col-span-5 truncate text-foreground/80">
                                 {details.path}
                             </div>
                             <div className="col-span-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                     onClick={() => navigate(`/sessions/${evt.session_id}`)}
                                     className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                 >
                                     Session <ExternalLink className="w-3 h-3" />
                                 </button>
                             </div>
                        </div>
                    )})}
                    <div ref={bottomRef} className="h-0" />
                </div>
            </div>
        </div>
    );
};
export default LiveView;
