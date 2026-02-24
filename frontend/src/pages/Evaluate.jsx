
import React, { useState, useMemo } from 'react';
import { 
  Send, 
  RotateCcw, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Users,
  User,
  Crosshair,
  UserX,
  CheckCircle
} from 'lucide-react';
import { trustService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import { useLiveContext } from '../context/LiveContext';

const Evaluate = () => {
  const initialFeatures = {
    session_id: `live_${Date.now()}`,
    user_id: 'analyst_simulate',
    features: {
      request_rate_per_min: 10,
      avg_request_interval: 1.5,
      navigation_entropy: 0.5,
      failed_login_attempts: 0,
      headless_browser_flag: false,
      captcha_passed: true,
      session_duration_sec: 300,
      pages_accessed: 5,
      api_calls_count: 12,
      concurrent_login_count: 1
    }
  };

  const [formData, setFormData] = useState(initialFeatures);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTechnicalWhy, setShowTechnicalWhy] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  // Consume Live Context for Target App Telemetry
  const { events: liveEvents, stats: liveStats } = useLiveContext();
  const [terminationStatus, setTerminationStatus] = useState({});

  const handleTerminateSession = async (sessionId) => {
    try {
      setTerminationStatus(prev => ({ ...prev, [sessionId]: 'terminating' }));
      // Using standard fetch since we need to pass Headers
      const res = await fetch('http://localhost:5000/api/v1/enforcement/terminate_session', {
          method: 'POST',
          headers: {
             'Content-Type': 'application/json',
             'X-API-Key': 'dev-api-key',
             'X-Platform': 'SECURITY_PLATFORM',
             'X-Role': 'ADMIN'
          },
          body: JSON.stringify({ session_id: sessionId })
      });
      if (res.ok) {
         setTerminationStatus(prev => ({ ...prev, [sessionId]: 'terminated' }));
      } else {
         setTerminationStatus(prev => ({ ...prev, [sessionId]: 'failed' }));
      }
    } catch (err) {
      setTerminationStatus(prev => ({ ...prev, [sessionId]: 'failed' }));
    }
  };

  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
      const next = new Set(expandedRows);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setExpandedRows(next);
  };

  const handleTerminateUser = async (userId, sessions) => {
    try {
      setTerminationStatus(prev => ({ ...prev, [userId]: 'terminating' }));
      const res = await fetch(`http://localhost:5000/api/v1/enforcement/users/${encodeURIComponent(userId)}/terminate`, {
          method: 'POST',
          headers: {
             'Content-Type': 'application/json',
             'X-API-Key': 'dev-api-key',
             'X-Platform': 'SECURITY_PLATFORM',
             'X-Role': 'ADMIN'
          },
          body: JSON.stringify({ sessions })
      });
      if (res.ok) {
         const data = await res.json();
         console.log("Terminate Response:", data);
         setTerminationStatus(prev => ({ ...prev, [userId]: 'terminated' }));
      } else {
         setTerminationStatus(prev => ({ ...prev, [userId]: 'failed' }));
      }
    } catch (err) {
      setTerminationStatus(prev => ({ ...prev, [userId]: 'failed' }));
    }
  };

  const activeUsers = useMemo(() => {
     if (!liveEvents || !Array.isArray(liveEvents)) return [];
     const userMap = new Map();
     
     [...liveEvents].reverse()
     .filter(evt => evt.source === 'TARGET_APP_3001' || evt.raw_features?.source === 'TARGET_APP_3001')
     .forEach(evt => {
        const actualActorId = evt.actor_id || evt.raw_features?.actor_id || 'anonymous';
        const actualSessionId = evt.session_id || evt.raw_features?.session_id || 'unknown';
        const key = actualActorId !== 'anonymous' ? actualActorId : actualSessionId;
        
        const current = userMap.get(key) || {
            id: key,
            actor_id: actualActorId,
            sessions: new Set(),
            event_count: 0,
            latest_risk: 0,
            latest_decision: 'ALLOW',
            is_terminated: false,
            first_seen: evt.timestamp_epoch,
            last_seen: evt.timestamp_epoch,
            history: [] 
        };
        
        if (actualSessionId !== 'unknown' && actualSessionId !== 'anonymous') {
            current.sessions.add(actualSessionId);
        }
        current.event_count++;
        current.latest_risk = evt.risk_score || evt.raw_features?.risk_score || evt.raw_features?.payload?.risk_score || current.latest_risk;
        current.latest_decision = evt.final_decision || evt.raw_features?.final_decision || evt.raw_features?.payload?.final_decision || current.latest_decision;
        current.last_seen = evt.timestamp_epoch || current.last_seen;
        
        const decision = evt.final_decision || evt.raw_features?.final_decision || evt.raw_features?.payload?.final_decision;
        if (decision === 'TERMINATED' || decision === 'TERMINATE' || terminationStatus[key] === 'terminated') {
            current.is_terminated = true;
            current.latest_decision = 'TERMINATED';
            current.latest_risk = 0; // Reset risk to 0 on logout/termination so it doesn't show 100% red indefinitely 
        } else if (evt.event_type === 'auth' || evt.event_type === 'AUTH_LOGIN' || evt.raw_features?.event_type === 'AUTH_LOGIN') {
            // ONLY explicitly revive on a fresh login to prevent delayed ghost-pings from reviving dead sessions
            if (terminationStatus[key] !== 'terminated') {
                current.is_terminated = false;
                if (current.latest_decision === 'TERMINATED') {
                    current.latest_decision = evt.final_decision || evt.raw_features?.final_decision || 'ALLOW';
                }
            }
        }
        current.history.push({
            type: evt.event_type || 'UNK',
            action: evt.raw_features?.path || evt.raw_features?.endpoint || evt.raw_features?.payload?.route || evt.route || 'ACTION',
            attack: evt.raw_features?.attack_signature,
            risk: evt.risk_score || evt.raw_features?.risk_score || 0,
            time: evt.timestamp_epoch || (Date.now() / 1000),
            session_id: actualSessionId
        });
        
        userMap.set(key, current);
     });
     
     return Array.from(userMap.values())
        .map(u => ({ ...u, sessions: Array.from(u.sessions) }))
        .sort((a, b) => b.last_seen - a.last_seen).slice(0, 10);
  }, [liveEvents, terminationStatus]);

  const featureWeights = result ? [
    { name: 'Req Rate', weight: formData.features.request_rate_per_min > 60 ? 0.8 : 0.2, actual: formData.features.request_rate_per_min },
    { name: 'Entropy', weight: formData.features.navigation_entropy > 0.8 ? 0.9 : 0.3, actual: formData.features.navigation_entropy },
    { name: 'Failed Logins', weight: formData.features.failed_login_attempts > 3 ? 0.95 : formData.features.failed_login_attempts * 0.2, actual: formData.features.failed_login_attempts },
    { name: 'Headless', weight: formData.features.headless_browser_flag ? 0.99 : 0.0, actual: formData.features.headless_browser_flag ? 'True' : 'False' },
    { name: 'API Calls', weight: formData.features.api_calls_count > 100 ? 0.75 : 0.25, actual: formData.features.api_calls_count },
  ].sort((a,b) => b.weight - a.weight).slice(0, 5) : [];

  const decayData = result ? Array.from({length: 12}).map((_, i) => {
      const baseRisk = 100 - result.trust_score;
      const recoveryRate = result.final_decision === 'ALLOW' ? 0.8 : (result.final_decision === 'RESTRICT' ? 0.85 : 0.95);
      const droppedRisk = baseRisk * Math.pow(recoveryRate, i); 
      return { time: `T+${i*5}m`, risk: parseFloat(Math.max(droppedRisk, 5).toFixed(1)) };
  }) : [];

  const handleInputChange = (field, value) => {
    // Ensure value is not empty - fallback to '0' or appropriate default for numeric
    const safeValue = value === '' ? 0 : value;
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [field]: safeValue }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setFeedbackGiven(null);
      setShowTechnicalWhy(false);
      
      // Filter out any N/A strings if we used them, convert to 0 for model
      const processedFeatures = {};
      Object.entries(formData.features).forEach(([k, v]) => {
        processedFeatures[k] = v === 'N/A' || v === '' ? 0 : v;
      });

      const res = await trustService.evaluate({ ...formData, features: processedFeatures });
      setResult(res);
      setLoading(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Inference engine failed');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ...initialFeatures,
      session_id: `live_${Date.now()}`
    });
    setResult(null);
    setError(null);
    setFeedbackGiven(null);
  };

  const getDecisionStyles = (decision) => {
    switch(decision) {
      case 'ALLOW': return { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', shadow: 'shadow-success/20' };
      case 'RESTRICT': return { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', shadow: 'shadow-warning/20' };
      case 'ESCALATE': 
      case 'DENY': return { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', shadow: 'shadow-danger/20' };
      default: return { color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Live Context Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
               <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Live Target App Telemetry
               </h3>
               <p className="text-sm text-slate-400">Monitoring real-time active sessions, users, and actions from the integrated application.</p>
            </div>
         </div>
         <div className="flex gap-8">
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Connected Users</span>
               <span className="text-3xl font-mono font-black text-white">{activeUsers.length > 0 ? activeUsers.length : (liveStats?.active_sessions || 0)}</span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Actions Intercepted</span>
               <span className="text-3xl font-mono font-black text-blue-400">{liveEvents?.length || 0}</span>
            </div>
         </div>
      </div>

      {/* Target App Active Sessions & User Tracking View */}
      <div className="bg-card border border-slate-700/30 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
           <Users className="w-5 h-5 text-purple-400" /> Active Users & Live Sessions Matrix
        </h2>
        
        {activeUsers.length === 0 ? (
           <div className="text-center p-8 bg-slate-800/30 rounded-xl border border-dashed border-slate-700/50">
               <p className="text-slate-500 italic">No live user sessions broadcasting from Target App currently.</p>
           </div>
        ) : (
           <div className="overflow-x-auto rounded-xl border border-slate-700/50">
              <table className="w-full text-left text-sm whitespace-nowrap">
                 <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700/50">
                    <tr>
                       <th className="p-4 font-bold text-xs uppercase tracking-wider">User ID / Core Identifier</th>
                       <th className="p-4 font-bold text-xs uppercase tracking-wider">Events & Severity Heatmap</th>
                       <th className="p-4 font-bold text-xs uppercase tracking-wider">Latest Security Risk</th>
                       <th className="p-4 font-bold text-xs uppercase tracking-wider text-right">SOC Enforcement Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800 bg-slate-900/20">
                    {activeUsers.map((user) => (
                       <React.Fragment key={user.id}>
                       <tr 
                          onClick={() => toggleRow(user.id)}
                          className="hover:bg-slate-800/40 transition-all cursor-pointer group"
                       >
                          <td className="p-4 relative">
                             <div className="font-bold text-white mb-1 flex items-center gap-2">
                                <User className="w-4 h-4 text-emerald-500" /> {user.actor_id}
                                
                                <div className="flex items-center gap-2 bg-slate-900/50 px-2 py-0.5 rounded-full border border-gray-800 ml-2">
                                  <div className={`w-2 h-2 rounded-full ${user.is_terminated || terminationStatus[user.id] === 'terminated' ? 'bg-gray-600' : 'bg-neonGreen animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`} />
                                  <span className={user.is_terminated || terminationStatus[user.id] === 'terminated' ? "text-gray-500 font-medium uppercase tracking-wider text-[10px]" : "text-neonGreen font-bold uppercase tracking-wider text-[10px]"}>
                                    {user.is_terminated || terminationStatus[user.id] === 'terminated' ? "Offline" : "Online"}
                                  </span>
                                </div>
                                
                                {expandedRows.has(user.id) ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-slate-500 ml-1 transition-transform group-hover:text-white" />
                                ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1 transition-transform group-hover:text-white" />
                                )}
                             </div>
                             <div className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1 uppercase tracking-widest">
                                <Crosshair className="w-3 h-3" /> {user.sessions.length} Session(s) Active
                             </div>
                          </td>
                          <td className="p-4">
                             <span className="text-blue-400 font-bold">{user.event_count}</span> events captured
                             <div className="flex gap-1 mt-1">
                                {user.history.slice(-12).map((h, i) => (
                                   <div key={i} className={`w-2 h-2 rounded-full ${h.type.includes('FAIL') ? 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-success/50'}`} title={`Action: ${h.action}`} />
                                ))}
                             </div>
                          </td>
                          <td className="p-4">
                             <div className="flex items-center gap-2">
                                <span className={`font-mono font-bold ${user.latest_risk >= 80 ? 'text-red-500' : user.latest_risk >= 40 ? 'text-amber-500' : 'text-emerald-500'}`}>{user.latest_risk.toFixed(1)}</span>
                                <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest rounded ${user.latest_decision === 'ALLOW' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : user.latest_decision === 'RESTRICT' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                   {user.latest_decision}
                                </span>
                             </div>
                          </td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                             {user.is_terminated || terminationStatus[user.id] === 'terminated' ? (
                                <span className="px-4 py-2 bg-red-900/20 text-red-500 border border-red-500/20 rounded font-bold text-xs inline-flex items-center gap-2">
                                   <ShieldAlert className="w-4 h-4" /> TERMINATED
                                </span>
                             ) : terminationStatus[user.id] === 'failed' ? (
                                <span className="px-4 py-2 bg-red-900/20 text-red-500 border border-red-500/20 rounded font-bold text-xs inline-flex items-center gap-2">
                                   <ShieldAlert className="w-4 h-4" /> API FAILED
                                </span>
                             ) : (
                                <button 
                                  onClick={() => handleTerminateUser(user.id, user.sessions)}
                                  disabled={terminationStatus[user.id] === 'terminating'}
                                  className="px-4 py-2 bg-slate-800 hover:bg-danger/20 hover:text-danger hover:border-danger/30 text-slate-300 border border-slate-700/50 rounded font-bold text-xs inline-flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm min-w-[180px] justify-center"
                                >
                                   {terminationStatus[user.id] === 'terminating' ? <RotateCcw className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                                   {terminationStatus[user.id] === 'terminating' ? 'Terminating...' : 'Quarantine User Hub'}
                                </button>
                             )}
                          </td>
                       </tr>
                       
                       {/* Expanded Details Row */}
                       {expandedRows.has(user.id) && (
                          <tr className="bg-slate-900/60 shadow-inner">
                             <td colSpan="4" className="p-0 border-t border-slate-800/80">
                                <div className="p-4 px-8 border-l-2 border-primary/50 ml-4 mb-4 mt-2 bg-black/20 rounded-r-xl">
                                   <div className="flex justify-between items-center mb-4">
                                      <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Detailed Event Trajectory — Timestamped</div>
                                   </div>
                                   <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1.5 pr-2">
                                   {user.history.slice().reverse().map((evt, idx) => (
                                      <div key={idx} className="flex items-center justify-between py-2.5 px-4 bg-slate-900/80 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 hover:border-slate-700 shadow-sm">
                                         <div className="flex items-center gap-4">
                                            <span className="text-[11px] font-mono text-slate-400 opacity-80 whitespace-nowrap">
                                                {new Date(evt.time * 1000).toLocaleString(undefined, {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                })}
                                            </span>
                                            <span className="text-purple-400/80 font-mono text-[10px] px-2 bg-purple-500/10 rounded border border-purple-500/20" title={evt.session_id}>
                                                SID: {evt.session_id.substring(0,8)}...
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${evt.type.includes('API') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                               {evt.type}
                                            </span>
                                            <span className="text-sm font-mono text-slate-300 font-semibold truncate max-w-[300px]">
                                               {evt.action}
                                               {evt.attack && <span className="text-danger ml-3 bg-danger/10 px-1.5 py-0.5 rounded border border-danger/30 text-[10px] tracking-widest uppercase shadow-[0_0_8px_rgba(239,68,68,0.4)]"><ShieldAlert className="w-3 h-3 inline pb-0.5 mr-1" />{evt.attack}</span>}
                                            </span>
                                         </div>
                                         <div className="flex items-center gap-4">
                                            <span className={`text-xs font-mono font-bold px-2 py-1 rounded bg-slate-950 border border-slate-800 ${evt.risk > 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                Risk: {evt.risk.toFixed(1)}
                                            </span>
                                            
                                            <div className="flex flex-col items-end pt-1">
                                               {evt.risk > 80 ? (
                                                  <>
                                                      <span className="text-[10px] font-black uppercase tracking-widest text-danger/80 mb-0.5 flex items-center gap-1">
                                                          <ShieldAlert className="w-3 h-3" /> Recommended Action: Quarantine
                                                      </span>
                                                      <span className="text-[9px] text-slate-400 font-mono italic">Task: Isolate endpoint & review {evt.attack || 'payload'}</span>
                                                  </>
                                               ) : evt.risk > 40 ? (
                                                  <>
                                                      <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500/80 mb-0.5 flex items-center gap-1">
                                                          <Activity className="w-3 h-3" /> Recommended Action: Investigate
                                                      </span>
                                                      <span className="text-[9px] text-slate-400 font-mono italic">Task: Monitor user trajectory</span>
                                                  </>
                                               ) : (
                                                  <>
                                                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80 mb-0.5 flex items-center gap-1">
                                                          <CheckCircle className="w-3 h-3" /> Recommended Action: None
                                                      </span>
                                                      <span className="text-[9px] text-slate-400 font-mono italic">Task: Standard observation</span>
                                                  </>
                                               )}
                                            </div>
                                         </div>
                                      </div>
                                   ))}
                                   </div>
                                </div>
                             </td>
                          </tr>
                       )}
                       </React.Fragment>
                    ))}
                 </tbody>
              </table>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight italic">What-If <span className="text-primary tracking-normal not-italic ml-1">Sandbox</span></h2>
          <p className="text-slate-400 text-sm">Simulate "What-If" behavioral vectors to understand the ML decision engine.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-slate-700/30 rounded-2xl p-6 space-y-6 shadow-xl relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                Request Rate <HelpCircle className="w-3 h-3 cursor-help text-slate-600" />
              </label>
              <input 
                type="number" 
                step="0.1"
                placeholder="N/A"
                value={formData.features.request_rate_per_min}
                onChange={(e) => handleInputChange('request_rate_per_min', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Navigation Entropy</label>
              <input 
                type="range" 
                min="0" max="1" step="0.01"
                value={formData.features.navigation_entropy}
                onChange={(e) => handleInputChange('navigation_entropy', parseFloat(e.target.value))}
                className="w-full accent-primary mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase">
                <span>Deterministic</span>
                <span>{(formData.features.navigation_entropy * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Failed Logins</label>
              <input 
                type="number" 
                placeholder="N/A"
                value={formData.features.failed_login_attempts}
                onChange={(e) => handleInputChange('failed_login_attempts', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration (s)</label>
              <input 
                type="number" 
                placeholder="N/A"
                value={formData.features.session_duration_sec}
                onChange={(e) => handleInputChange('session_duration_sec', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pages</label>
              <input 
                type="number" 
                placeholder="N/A"
                value={formData.features.pages_accessed}
                onChange={(e) => handleInputChange('pages_accessed', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">API Calls</label>
              <input 
                type="number" 
                placeholder="N/A"
                value={formData.features.api_calls_count}
                onChange={(e) => handleInputChange('api_calls_count', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Concurrent</label>
              <input 
                type="number" 
                placeholder="N/A"
                value={formData.features.concurrent_login_count}
                onChange={(e) => handleInputChange('concurrent_login_count', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={formData.features.headless_browser_flag}
                  onChange={(e) => handleInputChange('headless_browser_flag', e.target.checked)}
                  className="w-5 h-5 rounded-lg border-slate-700 bg-slate-900 text-primary focus:ring-offset-slate-900 focus:ring-primary appearance-none checked:bg-primary transition-all cursor-pointer border"
                />
                {formData.features.headless_browser_flag && <ShieldAlert className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none" />}
              </div>
              <span className="text-xs font-black text-slate-500 group-hover:text-white transition-colors uppercase tracking-widest">Headless Agent</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={formData.features.captcha_passed}
                  onChange={(e) => handleInputChange('captcha_passed', e.target.checked)}
                  className="w-5 h-5 rounded-lg border-slate-700 bg-slate-900 text-primary focus:ring-offset-slate-900 focus:ring-primary appearance-none checked:bg-success transition-all cursor-pointer border"
                />
                {formData.features.captcha_passed && <ShieldCheck className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none" />}
              </div>
              <span className="text-xs font-black text-slate-500 group-hover:text-white transition-colors uppercase tracking-widest">Verified Human</span>
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/80 disabled:bg-primary/50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
            >
              {loading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />}
              Analyze Behavior
            </button>
            <button 
              type="button"
              onClick={resetForm}
              className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl border border-slate-700/50 transition-all hover:text-white"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Intelligence Output</h2>
          <p className="text-slate-400 text-sm">Real-time decision state and recommended actions.</p>
        </div>

        {loading ? (
          <div className="bg-card border border-slate-700/30 rounded-2xl p-8 shadow-2xl space-y-8 animate-pulse">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-slate-800 rounded-2xl" />
               <div className="space-y-2">
                 <div className="h-2 w-20 bg-slate-800 rounded" />
                 <div className="h-8 w-48 bg-slate-800 rounded" />
               </div>
            </div>
            <div className="h-24 bg-slate-800/50 rounded-2xl" />
            <div className="h-10 bg-slate-800 rounded-xl" />
          </div>
        ) : result ? (
          <div className="bg-card border border-slate-700/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden fade-in space-y-8">
            {/* Decision Hero */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-6 rounded-3xl ${getDecisionStyles(result.final_decision).bg} ${getDecisionStyles(result.final_decision).color} border ${getDecisionStyles(result.final_decision).border} shadow-2xl`}>
                {result.final_decision === 'ALLOW' ? <ShieldCheck className="w-16 h-16" /> : <ShieldAlert className="w-16 h-16" />}
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-black text-slate-500 tracking-[0.3em]">Final Decision</span>
                <h3 className={`text-5xl font-black italic tracking-tighter ${getDecisionStyles(result.final_decision).color}`}>
                  {result.final_decision}
                </h3>
              </div>
              <div className="px-6 py-2 bg-slate-800/80 rounded-full border border-slate-700/50">
                <p className="text-sm font-bold text-white leading-tight">
                  <span className="text-slate-500 mr-2">CAUSE:</span> {result.primary_cause}
                </p>
              </div>
            </div>

            {/* Recommendation & Trust Band */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col justify-center`}>
                <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Recommended Action</span>
                <p className="text-sm font-bold text-primary">{result.recommended_action || 'Monitor Only'}</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30 flex flex-col justify-center items-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Confidence</span>
                <div className="flex items-center gap-2">
                   <Zap className="w-3 h-3 text-accent" />
                   <span className="text-xl font-black text-white">{result.trust_score.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Progressive Disclosure: Technical Why */}
            <div className="space-y-3">
              <button 
                onClick={() => setShowTechnicalWhy(!showTechnicalWhy)}
                className="w-full flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all font-bold text-xs"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  TECHNICAL EVIDENCE
                </div>
                {showTechnicalWhy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showTechnicalWhy && (
                <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-700/50 space-y-4 fade-in">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-600 tracking-widest pl-1">Inference Context</span>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      The decision was synthesized by the Resilience Intelligence Engine based on behavioral markers including navigation entropy ({formData.features.navigation_entropy}), request rate ({formData.features.request_rate_per_min}/min), and session isolation tags.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                       <span className="block text-[8px] text-slate-500 font-bold uppercase mb-1">Risk Bias</span>
                       <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                         <div className="h-full bg-danger" style={{ width: '35%' }} />
                       </div>
                    </div>
                    <div className="flex-1 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                       <span className="block text-[8px] text-slate-500 font-bold uppercase mb-1">Model Drift</span>
                       <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                         <div className="h-full bg-success" style={{ width: '12%' }} />
                       </div>
                    </div>
                  </div>
                  
                  {/* Feature Weight Heatmap */}
                  <div className="pt-4 border-t border-slate-700/30">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1 block mb-4">Feature Weight Heatmap</span>
                      <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={featureWeights} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                                  <XAxis type="number" hide domain={[0, 1]} />
                                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                  <RechartsTooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem', fontSize: '12px' }}
                                    formatter={(value, name, props) => [`Weight: ${(value * 100).toFixed(0)}% (Val: ${props.payload.actual})`, 'Impact']}
                                  />
                                  <Bar dataKey="weight" radius={[0, 4, 4, 0]} barSize={12}>
                                      {featureWeights.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.weight > 0.7 ? '#ef4444' : entry.weight > 0.4 ? '#f59e0b' : '#3b82f6'} />
                                      ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* Trust Decay/Recovery Graph */}
                  <div className="pt-4 border-t border-slate-700/30">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1 block mb-4">Simulated Trust Decay & Recovery</span>
                      <div className="h-40 w-full bg-slate-900/50 rounded-lg p-2 border border-slate-700/30">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={decayData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                  <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
                                  <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem', fontSize: '12px' }}
                                  />
                                  <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} label={{ position: 'insideTopLeft', value: 'Critical', fill: '#ef4444', fontSize: 9 }} />
                                  <Line type="monotone" dataKey="risk" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 2, fill: '#0ea5e9' }} activeDot={{ r: 4 }} name="Risk Score" />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* Decision Matrix Audit Log */}
                  <div className="pt-4 border-t border-slate-700/30">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1 block mb-3">Decision Matrix Audit Log</span>
                      <div className="space-y-2 font-mono text-[10px] bg-slate-950 p-3 rounded-lg border border-slate-800">
                          <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-1">
                              <span>Timestamp</span><span>Rule Triggered</span><span>Action</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                              <span>T-0ms</span><span>Ingestion Validation</span><span className="text-emerald-500">Passed</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                              <span>T+12ms</span><span>Initial Risk &gt; {(100 - result.trust_score).toFixed(0)}</span><span className="text-amber-500">Flagged</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                              <span>T+45ms</span><span>Feature Weights Vectorized</span><span className="text-blue-500">Computed</span>
                          </div>
                          {result.final_decision !== 'ALLOW' && (
                            <div className="flex justify-between items-center text-slate-300">
                                <span>T+80ms</span><span>Policy Threshold Met</span><span className="text-red-500">{result.final_decision}</span>
                            </div>
                          )}
                      </div>
                  </div>

                </div>
              )}
            </div>

            {/* Analyst Feedback Loop */}
            <div className="pt-4 border-t border-slate-700/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verify Intelligence</span>
                <div className="flex items-center gap-3">
                  {feedbackGiven ? (
                    <div className="flex items-center gap-2 text-primary font-bold text-xs bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 animate-in zoom-in-95">
                      {feedbackGiven === 'confirm' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                      Feedback Logged
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => setFeedbackGiven('false_positive')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-danger/20 hover:text-danger hover:border-danger/30 text-slate-400 rounded-lg border border-slate-700/50 text-xs font-bold transition-all"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" /> False Positive
                      </button>
                      <button 
                        onClick={() => setFeedbackGiven('confirm')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg border border-primary/30 text-xs font-bold transition-all"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> Confirm Incident
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/20 border-2 border-dashed border-slate-700/30 rounded-2xl h-[420px] flex flex-col items-center justify-center p-12 text-center group">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700 group-hover:scale-110 transition-transform duration-300">
              <AlertCircle className="w-6 h-6 text-slate-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-500">Engine Standby</h4>
            <p className="text-slate-600 text-sm mt-2">Simulate behavioral signals to generate real-time trust intelligence.</p>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-danger/10 text-danger border border-danger/20 rounded-xl text-sm font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            Execution Failed: {error}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Evaluate;
