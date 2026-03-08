import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, ShieldCheck, Crosshair, Server, Unlock, Zap, History, ChevronRight, Brain } from 'lucide-react';
import { api } from '../../services/api'; // Axios instance

interface PortInfo {
  port: number;
  service: string;
  state: string;
  version: string;
  risk_level: string;
}

interface AttackPath {
  source_node: string;
  target_node: string;
  technique: string;
  likelihood: string;
  detected_at: string;
}

interface AttackSurfaceData {
  host: string;
  summary: {
    total_open_ports: number;
    high_risk_count: number;
    last_scan: string | null;
    exposed_sessions_count: number;
    ai_insight?: string;
  };
  ports: PortInfo[];
  attack_paths: AttackPath[];
  exposed_sessions: any[];
}

const AttackSurfacePage = () => {
  const [data, setData] = useState<AttackSurfaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  
  // Real-time updates handled via a placeholder or context extension later
  
  const fetchSurfaceData = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/api/v1/attack-surface/data');
      // api.get() already unwraps response.data under the hood!
      const responseData = res;
      console.log("[AttackSurface] fetchSurfaceData parsed payload:", responseData);
      setData(responseData as AttackSurfaceData);
    } catch (e) {
      console.error("Failed to fetch attack surface:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurfaceData();
  }, []);

  const triggerScan = async () => {
    if (scanning) return;
    try {
      setScanning(true);
      const originalLastScan = data?.summary?.last_scan;
      await api.post('/api/v1/attack-surface/scan', { host: "127.0.0.1" });
      
      // Poll every 3 seconds for up to 45 seconds (15 attempts) to allow deep NMAP scans to finish
      let attempts = 0;
      const pollInterval = window.setInterval(async () => {
        attempts++;
        try {
          const res = await api.get<any>('/api/v1/attack-surface/data');
          const newData = res as AttackSurfaceData;
          console.log("[AttackSurface] Polling pollInterval parsed:", newData);
          if (newData?.summary?.last_scan !== originalLastScan || attempts >= 15) {
            clearInterval(pollInterval);
            setData(newData);
            setScanning(false);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 3000);
    } catch (error) {
       console.error("Scan trigger failed:", error);
       setScanning(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-12">
        <Server className="w-8 h-8 animate-pulse text-primary" />
        <span className="ml-3 text-muted-foreground">Mapping Attack Surface...</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]">
               <Crosshair className="text-blue-400 w-6 h-6" />
             </div>
             <h1 className="text-3xl font-black tracking-tight text-white">
               Active Attack Surface
             </h1>
          </div>
          <p className="text-blue-200/60 font-medium pl-14">Continuous exposure mapping and bidirectional path inference.</p>
        </div>
        <button 
          onClick={triggerScan}
          disabled={scanning}
          className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-3 transition-all tracking-wide ${
            scanning 
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] border border-blue-500 hover:scale-[1.02]'
          }`}
        >
          {scanning ? (
            <>
              <Activity className="w-5 h-5 animate-spin" />
              <span>Scanning Target...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Run NMAP Scan</span>
            </>
          )}
        </button>
      </div>
      
      {/* Target Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Host Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0A0E14] to-[#121A26] border border-white/5 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Server className="w-16 h-16 text-blue-500" /></div>
           <div className="text-xs text-blue-400/80 font-bold uppercase tracking-widest flex items-center gap-2 mb-3"><Server className="w-3.5 h-3.5" /> Target Host</div>
           <div className="text-3xl font-black text-white tracking-tight">{data?.host || "localhost"}</div>
           <div className="text-sm font-medium mt-3 text-emerald-400 flex items-center bg-emerald-500/10 w-fit px-2.5 py-1 rounded-full border border-emerald-500/20">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
             Online & Monitored
           </div>
        </div>
        
        {/* Open Ports Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0A0E14] to-[#121A26] border border-white/5 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Unlock className="w-16 h-16 text-indigo-500" /></div>
           <div className="text-xs text-indigo-400/80 font-bold uppercase tracking-widest flex items-center gap-2 mb-3"><Unlock className="w-3.5 h-3.5" /> Open Ports</div>
           <div className="text-4xl font-black text-white tracking-tight">{data?.summary?.total_open_ports || 0}</div>
           <div className="text-sm font-medium mt-3 text-white/50">Discovered Services</div>
        </div>
        
        {/* High Risk Exposures Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-red-950/20 to-[#121A26] border border-red-500/20 shadow-[0_0_30px_-5px_rgba(239,68,68,0.1)] relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ShieldAlert className="w-16 h-16 text-red-500" /></div>
           <div className="text-xs text-red-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-3"><ShieldAlert className="w-3.5 h-3.5" /> High Risk Exposures</div>
           <div className="text-4xl font-black text-red-400 tracking-tight">{data?.summary?.high_risk_count || 0}</div>
           <div className="text-sm font-medium mt-3 text-red-400/60 flex items-center gap-1.5">
             Critical port access limits
           </div>
        </div>
        
        {/* Last Scan Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0A0E14] to-[#121A26] border border-white/5 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><History className="w-16 h-16 text-emerald-500" /></div>
           <div className="text-xs text-emerald-400/80 font-bold uppercase tracking-widest flex items-center gap-2 mb-3"><History className="w-3.5 h-3.5" /> Last Scan</div>
           <div className="text-2xl font-black text-white tracking-tight">{data?.summary?.last_scan ? new Date(data.summary.last_scan).toLocaleTimeString() : "Never"}</div>
           <div className="text-sm font-medium mt-3 text-white/50">Auto-mapping active</div>
        </div>
      </div>

      {/* AI Reasoning Card */}
      {data?.summary?.ai_insight && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-900/20 via-[#121A26] to-[#0A0E14] border border-blue-500/20 shadow-lg p-6 flex flex-col sm:flex-row gap-6 items-start group">
          <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
             <Brain className="w-8 h-8 text-blue-400" />
          </div>
          <div className="space-y-2 w-full">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                AI Security Analyst Insight
              </h3>
            </div>
            <p className="text-white/80 leading-relaxed text-sm font-medium">
              {data.summary.ai_insight}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
         {/* Open Ports Table */}
        <div className="rounded-2xl bg-[#0A0E14] border border-white/10 shadow-xl overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-900/10 to-transparent">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Server className="w-4 h-4" />
              </div>
              Enumerated Services
            </h3>
            <p className="text-sm text-white/40 mt-1 font-medium">Categorized mapped port exposures.</p>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#121A26] text-white/50 text-[10px] uppercase tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-black">Port/State</th>
                  <th className="px-6 py-4 font-black">Service</th>
                  <th className="px-6 py-4 font-black hidden sm:table-cell">Version</th>
                  <th className="px-6 py-4 font-black">Risk Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.ports && data.ports.length > 0 ? (
                  data.ports.map((p: PortInfo, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-mono text-white/80 group-hover:text-blue-400 transition-colors">
                        <span className="font-bold text-white">{p.port}</span>
                        <span className="text-white/30 mx-1.5">/</span>
                        <span className={p.state === 'open' ? 'text-emerald-400' : 'text-amber-400'}>{p.state}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-white/90">{p.service.toUpperCase()}</td>
                      <td className="px-6 py-4 text-white/50 truncate max-w-[200px] hidden sm:table-cell font-mono text-xs" title={p.version}>{p.version || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] uppercase font-black tracking-widest rounded-md border min-w-[70px] inline-flex justify-center ${
                          p.risk_level === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          p.risk_level === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {p.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-white/30 space-y-3">
                        <Unlock className="w-8 h-8 opacity-50" />
                        <p className="font-medium text-sm">No open ports detected on the target.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attack Paths */}
        <div className="rounded-2xl bg-[#0A0E14] border border-white/10 shadow-xl overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-purple-900/10 to-transparent">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Activity className="w-4 h-4" />
              </div>
              Inferred Attack Paths
            </h3>
            <p className="text-sm text-white/40 mt-1 font-medium">Logical progression modeling based on vulnerabilities.</p>
          </div>
          <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
            {data?.attack_paths && data.attack_paths.length > 0 ? (
               data.attack_paths.map((path: AttackPath, i: number) => (
                 <div key={i} className="flex flex-col p-5 rounded-xl bg-[#121A26] border border-white/5 hover:border-white/10 transition-colors relative overflow-hidden group">
                   {/* Animated gradient highlight on hover */}
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
                   
                   <div className="flex items-center justify-between mb-4 relative z-10">
                     <span className={`text-[10px] px-2.5 py-1 rounded-md font-black tracking-widest border shadow-sm ${
                       path.likelihood === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/10' : 
                       'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-orange-500/10'
                     }`}>
                       {path.likelihood} PROBABILITY
                     </span>
                     <span className="text-[10px] uppercase font-black text-white/30 tracking-widest">
                       Detected {new Date(path.detected_at).toLocaleTimeString()}
                     </span>
                   </div>
                   
                   {/* Visual Path Visualization */}
                   <div className="flex items-center gap-4 text-sm relative z-10 mb-5 pb-5 border-b border-white/5">
                     <div className="flex-1">
                       <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1.5 pl-1">Source Vector</div>
                       <div className="font-bold px-4 py-2.5 bg-[#0A0E14] border border-white/10 text-white/90 rounded-lg shadow-inner truncate">
                         {path.source_node}
                       </div>
                     </div>
                     <div className="flex flex-col items-center justify-center mt-6">
                       <ChevronRight className="w-5 h-5 text-white/20" />
                     </div>
                     <div className="flex-1">
                       <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1.5 pl-1">Target Asset</div>
                       <div className="font-bold px-4 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg shadow-[0_0_15px_-5px_rgba(59,130,246,0.2)] truncate">
                         {path.target_node}
                       </div>
                     </div>
                   </div>
                   
                   <div className="text-sm relative z-10 bg-[#0A0E14]/50 p-3.5 rounded-lg border border-white/5">
                     <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Assessed Technique</div>
                     <div className="font-medium text-white/80 font-mono text-xs">{path.technique}</div>
                   </div>
                 </div>
               ))
            ) : (
               <div className="py-16 flex flex-col items-center justify-center text-center">
                 <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                   <ShieldCheck className="w-8 h-8 text-emerald-500" />
                 </div>
                 <h4 className="text-white font-bold text-lg">No Known Vectors</h4>
                 <p className="text-white/40 text-sm mt-1 max-w-[250px]">
                   No explicit attack paths inferred from the current exposure signature.
                 </p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttackSurfacePage;
