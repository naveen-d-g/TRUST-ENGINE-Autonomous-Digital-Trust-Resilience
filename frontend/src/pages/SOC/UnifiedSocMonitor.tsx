import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Activity, 
  Terminal, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle,
  Play,
  Pause,
  LifeBuoy
} from "lucide-react";
import { useLiveContext } from "../../context/LiveContext";
import { useLiveStats } from "../../hooks/useLiveStats";
import { socApi } from "../../api/soc.api";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const UnifiedSocMonitor = () => {
    const navigate = useNavigate();
    const { events, isPaused, togglePause, isConnected, error } = useLiveContext();
    const { data: stats } = useLiveStats();
    const [graphData, setGraphData] = useState<any[]>([]);
    const [showSafetyMeasures, setShowSafetyMeasures] = useState(false);
    const prevTrustRef = useRef(100);

    const [isResetting, setIsResetting] = useState(false);
    const [isRecovered, setIsRecovered] = useState(false);

    // Accumulate graph data from stats/events
    useEffect(() => {
        if (!stats) return;
        
        const riskVal = stats.metrics?.global_risk_score || 0;
        const trustVal = 100 - riskVal;
        const newPoint = {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            trust: trustVal,
            risk: riskVal,
        };

        setGraphData(prev => [...prev, newPoint].slice(-30)); // Keep last 30 points

        const activeIncidents = stats.metrics?.active_incidents || 0;

        // Trigger safety measures if trust drops significantly OR if incidents are active
        if ((trustVal < 50 && prevTrustRef.current >= 50) || (activeIncidents > 0)) {
            setShowSafetyMeasures(true);
        }
        prevTrustRef.current = trustVal;
    }, [stats]);

    const handleEnforceReset = async () => {
        setIsResetting(true);
        try {
            await socApi.enforceReset();
            setIsRecovered(true);
            
            // Show success message for 3 seconds before closing
            setTimeout(() => {
                setShowSafetyMeasures(false);
                setIsRecovered(false);
            }, 3000);
            
        } catch (err) {
            console.error("Failed to reset session:", err);
            // Optional: add an error toast here
        } finally {
            setIsResetting(false);
        }
    };

    const getRiskColor = (event: any) => {
        const severity = event.severity || (event.risk_score > 70 ? 'critical' : event.risk_score > 40 ? 'medium' : 'low');
        if (severity === 'critical' || severity === 'high') return "text-red-500";
        if (severity === 'medium') return "text-amber-500";
        return "text-emerald-500";
    };

    const getRiskIcon = (event: any) => {
        const severity = event.severity || (event.risk_score > 70 ? 'critical' : event.risk_score > 40 ? 'medium' : 'low');
        if (severity === 'critical' || severity === 'high') return <AlertTriangle className="w-4 h-4" />;
        if (severity === 'medium') return <Activity className="w-4 h-4" />;
        return <CheckCircle className="w-4 h-4" />;
    };

    return (
        <div className="space-y-6 h-[calc(100vh-80px)] flex flex-col fade-in text-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-gray-800/60 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                        <Shield className="w-7 h-7 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 uppercase tracking-tighter">
                            Live Threat Monitoring
                        </h1>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                            Real-time autonomous digital trust & resilience engine
                        </p>
                    </div>
                </div>
                </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 shrink-0">
                {/* System Trust Score */}
                <div className="lg:col-span-1 bg-gray-900/40 border border-gray-800/60 p-6 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">System Trust Score</span>
                    
                    <div className="relative">
                        <div className={`text-8xl font-black ${(100 - (stats?.metrics?.global_risk_score || 0)) < 50 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {Math.round(100 - (stats?.metrics?.global_risk_score || 0))}
                        </div>
                    </div>
                    
                    <div className={`mt-6 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                        (100 - (stats?.metrics?.global_risk_score || 0)) < 50 
                        ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    }`}>
                        {(100 - (stats?.metrics?.global_risk_score || 0)) < 50 ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {(100 - (stats?.metrics?.global_risk_score || 0)) < 50 ? 'Critical Threat Detected' : 'System Stable'}
                    </div>
                </div>

                {/* Real-time Threat Graph */}
                <div className="lg:col-span-3 bg-gray-900/40 border border-gray-800/60 p-6 rounded-3xl flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Live Risk Analysis</span>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Trust Score</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Risk Level</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graphData}>
                                <defs>
                                    <linearGradient id="colorTrust" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={[0, 100]} hide />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', fontSize: '10px' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="trust" 
                                    stroke="#3B82F6" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorTrust)" 
                                    isAnimationActive={false}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="risk" 
                                    stroke="#EF4444" 
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorRisk)" 
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Live Threat Stream Table */}
            <div className="flex-1 bg-black/40 border border-gray-800/60 rounded-3xl overflow-hidden flex flex-col backdrop-blur-sm">
                <div className="px-8 py-4 bg-gray-900/40 border-b border-gray-800/60 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                            Real-time Telemetry Feed 
                            <span className="ml-2 text-blue-400/60 lowercase italic ml-2">
                                ({events.length} signals)
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                        <span>Status: <span className={isConnected ? "text-emerald-500" : "text-red-500"}>
                            {error ? error : (isConnected ? "Connected" : "Disconnected")}
                        </span></span>
                        <span>Protocol: <span className="text-blue-400">gRPC/SSE</span></span>
                        <div className="flex items-center gap-2 border-l border-gray-800 pl-4 ml-2">
                            <button 
                                onClick={handleEnforceReset}
                                disabled={isResetting}
                                className={`px-3 py-1 ${isResetting ? 'bg-red-800' : 'bg-red-500/10 hover:bg-red-500/20'} text-red-500 rounded transition-colors flex items-center gap-2 mr-2`}
                            >
                                <LifeBuoy className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
                                {isResetting ? 'RESOLVING...' : 'RESOLVE ALL'}
                            </button>
                             <button 
                                onClick={() => window.location.reload()}
                                className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
                            >
                                RECONNECT
                            </button>
                            <button 
                                onClick={togglePause}
                                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-500" /> : <Pause className="w-3.5 h-3.5 text-red-500" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-black/80 backdrop-blur-md z-10">
                            <tr className="border-b border-gray-800/40">
                                <th className="px-8 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest w-32">Timestamp</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest w-16 text-center">Risk</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest w-16 text-center">Status</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest w-32">Method/Type</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">Endpoint / Activity</th>
                                <th className="px-8 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest w-24 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/20">
                            {events.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
                                        Waiting for active telemetry signals...
                                    </td>
                                </tr>
                            ) : events.map((evt: any, idx: number) => {
                                if (!evt) return null;
                                const feat = evt.raw_features || {};
                                const timestamp = evt.timestamp_epoch || Date.now() / 1000;
                                return (
                                    <tr key={evt.event_id || idx} className="group hover:bg-blue-500/5 transition-colors">
                                        <td className="px-8 py-4 text-[10px] font-mono text-gray-500">
                                            {new Date(timestamp * 1000).toLocaleTimeString([], { hour12: true })}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className={`flex justify-center ${getRiskColor(evt)}`}>
                                                {getRiskIcon(evt)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`text-[10px] font-bold ${
                                                (feat.status_code || 200) >= 400 ? 'text-red-500' :
                                                (feat.status_code || 200) >= 300 ? 'text-amber-500' :
                                                'text-emerald-500'
                                            }`}>
                                                {feat.status_code || 200}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded border flex items-center gap-1 ${
                                                    evt.event_type === 'auth' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                    feat.method === 'NAVIGATE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                    evt.event_type === 'api' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                                    'bg-purple-500/10 border-purple-500/20 text-purple-500'
                                                }`}>
                                                    {feat.method === 'NAVIGATE' ? <ExternalLink className="w-2.5 h-2.5" /> : null}
                                                    {feat.method || evt.event_type?.toUpperCase() || 'HTTP'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className={`text-[11px] font-black tracking-tighter ${(feat.status_code || 200) >= 400 ? 'text-red-400' : 'text-white/90'}`}>
                                                    {evt.event_type === 'infra' 
                                                        ? `CPU: ${feat.cpu_load || 0}% | MEM: ${feat.mem_usage || 0}%`
                                                        : feat.endpoint || feat.path || feat.action || 'System Activity'
                                                    }
                                                </span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                                                        {evt.session_id ? `${evt.session_id.substring(0, 12)}...` : 'GLOBAL_SIGNAL'}
                                                    </span>
                                                    {(feat.status_code || 200) >= 400 && (
                                                        <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter bg-red-500/10 px-1 rounded">
                                                            INVALID TARGET
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => navigate(`/sessions/${evt.session_id || ''}`)}
                                                className="text-[9px] font-black text-blue-400 hover:text-blue-300 flex items-center gap-1 ml-auto uppercase"
                                                disabled={!evt.session_id}
                                            >
                                                Inspect <ExternalLink className="w-2.5 h-2.5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Safety Measures Popup */}
            {showSafetyMeasures && (
                <div className="fixed bottom-8 right-8 w-96 bg-gray-900 border-2 border-red-500/50 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-5 fade-in duration-500 z-50 overflow-hidden">
                    <div className="absolute top-0 right-0 p-2">
                        <button onClick={() => setShowSafetyMeasures(false)} className="text-gray-500 hover:text-white">✕</button>
                    </div>
                    {isRecovered ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Recovery Process Done</h3>
                            <p className="text-xs text-emerald-400 font-bold tracking-wide">
                                Terminated active attack scripts. System returned to normal state.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-4 items-start mb-6">
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                                    <LifeBuoy className="w-6 h-6 text-red-500 animate-spin-slow" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Safety Intervention</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed mt-1">
                                        Critical risk threshold breached. Recommended actions:
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <button 
                                    onClick={handleEnforceReset}
                                    disabled={isResetting}
                                    className={`w-full py-3 ${isResetting ? 'bg-red-800 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} rounded-xl text-[10px] font-black uppercase tracking-widest transition-all`}
                                >
                                    {isResetting ? 'ENFORCING...' : 'Enforce Immediate Session Reset'}
                                </button>
                                <button className="w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Enable Adaptive 2FA
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default UnifiedSocMonitor;
