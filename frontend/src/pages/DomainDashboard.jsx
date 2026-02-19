import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { runtimeConfig } from '../config/runtimeConfig';
import { useAuth } from '../auth/AuthContext';
import { ShieldCheck, ShieldAlert, RefreshCw, AlertTriangle, Lightbulb, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 7: Remove unused props
const DomainDashboard = ({ title, domainKey }) => {
    const { isAuthenticated } = useAuth();
    const [metrics, setMetrics] = useState(null);
    const [liveEvents, setLiveEvents] = useState([]);
    // Remove unused loading state and tableRef logic
    // const [loading, setLoading] = useState(true);
    // const tableRef = useRef(null);

    // 1. Fetch High-Level Metrics (Polled every 5s) using ApiService
    useEffect(() => {
        const fetchMetrics = async () => {
             try {
                // Use standardized ApiService to get required security headers
                const data = await api.get(`/api/v1/metrics/domain/${domainKey}`);
                setMetrics(data);
             } catch (e) {
                 console.error("Failed to fetch domain metrics", e);
             }
        };

        if (isAuthenticated) {
            fetchMetrics();
            const interval = setInterval(fetchMetrics, 5000);
            return () => clearInterval(interval);
        }
    }, [domainKey, isAuthenticated]);

    // 2. Initial History Fetch & Real-time Event Stream
    useEffect(() => {
        let eventSource;
        
        if (isAuthenticated) {
            // A. Fetch History Snapshot using ApiService
            api.get(`/api/v1/live/history?domain=${domainKey}`)
            .then(data => {
                if (Array.isArray(data)) {
                    setLiveEvents(data.reverse()); // Store Newest First for Table convenience
                }
            })
            .catch(err => console.error("Failed to fetch domain history", err));

            // B. Connect Stream using runtimeConfig
            const baseUrl = runtimeConfig.api.baseUrl;
            const url = `${baseUrl}/api/v1/live/stream?token=dev-api-key&domain=${domainKey}`;
            console.log(`[DomainDashboard] Connecting to ${title} Stream at ${url}...`);
            
            try {
                eventSource = new EventSource(url);
                
                eventSource.onmessage = (e) => {
                    if (e.data === ': heartbeat') return;
                    try {
                        const data = JSON.parse(e.data);
                        if (data.type === 'connected') return;

                        setLiveEvents(prev => {
                            const newEvents = [data, ...prev].slice(0, 50); // Keep last 50
                            return newEvents;
                        });
                    } catch (err) {
                        console.error("Parse Error", err);
                    }
                };
            } catch (err) {
                console.error("SSE Connection Failed", err);
            }
        }
        return () => {
            if (eventSource) eventSource.close();
        };
    }, [domainKey, isAuthenticated, title]);

    const domainScore = metrics?.risk_score || 0;

    return (
        <div className="space-y-6 fade-in text-foreground">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                        {title} Intelligence
                    </h1>
                    <p className="text-muted-foreground text-sm">Domain-specific risk analysis and telemetry.</p>
                </div>
                {liveEvents.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-500 animate-pulse">
                        <Activity className="w-3 h-3" /> Live Feed Active
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Domain Health Card */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-muted-foreground font-medium text-sm">Domain Risk Score</h3>
                        <div className="mt-2 flex items-baseline gap-2">
                             <span className={`text-4xl font-bold ${domainScore > 50 ? 'text-red-500' : 'text-emerald-500'}`}>
                                 {domainScore}/100
                             </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Normalized Anomaly Probability</p>
                    </div>
                    <div className={`p-4 rounded-full ${domainScore > 50 ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                         {domainScore > 50 ? <ShieldAlert className="w-8 h-8 text-red-500" /> : <ShieldCheck className="w-8 h-8 text-emerald-500" />}
                    </div>
                </div>

                 {/* Active Threats */}
                 <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-muted-foreground font-medium text-sm">Active Threats</h3>
                    <p className="text-3xl font-bold text-foreground mt-2">{metrics?.active_threats || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Critical events in last window</p>
                    <div className="mt-2 text-xs font-mono text-muted-foreground">
                        Velocity: {metrics?.risk_velocity > 0 ? '+' : ''}{metrics?.risk_velocity || 0} /hr
                    </div>
                </div>

                {/* Recommendations */}
                 <div className="bg-card p-6 rounded-xl border border-border shadow-sm bg-gradient-to-br from-card to-muted/20">
                    <h3 className="text-muted-foreground font-medium text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        AI Recommendations
                    </h3>
                    <div className="mt-3 text-sm font-medium text-foreground">
                        {metrics?.recommended_action || "Calibrating baseline..."}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Updated in real-time based on dominant risk factors.</p>
                </div>
            </div>

            {/* Charts Row - Using Live Events for Velocity Visualization */}
             <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Event Velocity (Real-time)</h3>
                <div className="h-[250px] w-full">
                     {liveEvents.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[...liveEvents].reverse()}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                <XAxis 
                                    dataKey="timestamp_epoch" 
                                    tickFormatter={(t) => new Date(t * 1000).toLocaleTimeString()} 
                                    stroke="#94a3b8" 
                                    tick={{fontSize: 10}} 
                                    minTickGap={10} // Enforce minimal gap to simulate ~10s distribution visibility if data is dense
                                    interval="preserveStartEnd"
                                />
                                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                                <Tooltip 
                                    labelFormatter={(t) => new Date(t * 1000).toLocaleTimeString()}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Line 
                                    type="step" 
                                    dataKey={
                                        domainKey === 'infra' ? 'raw_features.cpu_load' :
                                        domainKey === 'api' ? 'raw_features.usage_count' :
                                        domainKey === 'network' ? 'raw_features.port' :
                                        'raw_features.status_code' // web default
                                    }
                                    name={
                                        domainKey === 'infra' ? 'CPU Load' :
                                        domainKey === 'api' ? 'Usage Count' :
                                        domainKey === 'network' ? 'Port' :
                                        'Status Code'
                                    }
                                    stroke="#06b6d4" 
                                    strokeWidth={2}
                                    dot={false}
                                />
                                 {/* Fallback line for other metrics */}
                                 <Line 
                                    type="monotone" 
                                    dataKey="risk_score" 
                                    name="Risk Score"
                                    stroke="#ef4444" 
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                     ) : (
                         <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                             <RefreshCw className="w-8 h-8 animate-spin mb-2 opacity-50" />
                             <span>No events are there</span>
                         </div>
                     )}
                </div>
            </div>

            {/* Live Events Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                 <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                     <h3 className="font-bold text-foreground">Live {title} Events</h3>
                     <span className="text-xs text-muted-foreground font-mono">STREAM: {domainKey.toUpperCase()}</span>
                 </div>
                 <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 sticky top-0 z-10 backdrop-blur">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Timestamp</th>
                                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Severity</th>
                                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Attack Type</th>
                                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Status Code</th>
                                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {liveEvents.length > 0 ? liveEvents.map((evt, idx) => {
                                const features = evt.features || evt.raw_features || {};
                                
                                // Infer Attack Type
                                let attackType = "Unknown";
                                if (evt.session_id?.includes("WEB")) attackType = "Web Attack";
                                else if (evt.session_id?.includes("API")) attackType = "API Abuse";
                                else if (evt.session_id?.includes("NET")) attackType = "Network Probe";
                                else if (evt.session_id?.includes("INFRA")) attackType = "Infra Stress";
                                else if (features.method) attackType = features.method + " Request";

                                // Extract Status Code
                                const statusCode = features.status_code || "N/A";

                                return (
                                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-3 text-sm text-foreground font-mono">{evt.timestamp_epoch ? new Date(evt.timestamp_epoch * 1000).toLocaleTimeString() : 'N/A'}</td>
                                    <td className="px-6 py-3 text-sm">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                                            ${evt.severity === 'high' || evt.severity === 'critical' ? 'bg-red-500/10 text-red-500' : 
                                              evt.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' : 
                                              'bg-blue-500/10 text-blue-500'}`}>
                                            {evt.severity || 'INFO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-foreground">{attackType}</td>
                                    <td className="px-6 py-3 text-sm text-mono text-muted-foreground">{statusCode}</td>
                                    <td className="px-6 py-3 text-sm text-muted-foreground">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{evt.session_id}</span>
                                            <span className="text-xs font-mono opacity-75">
                                                {JSON.stringify(features).substring(0, 50)}...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                            No events are there
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};
export default DomainDashboard;
