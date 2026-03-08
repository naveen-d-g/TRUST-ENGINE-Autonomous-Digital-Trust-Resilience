import React, { useState } from 'react';
import { useSessionStore } from '../../../store/sessionStore';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, Database, ChevronDown, Zap, Info, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BatchResultsTable: React.FC = () => {
  const { sessions } = useSessionStore();
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getDecisionStyles = (decision: string) => {
    const d = decision?.toUpperCase() || 'MONITOR';
    switch (d) {
      case 'ALLOW': return { text: 'text-success', bg: 'bg-success/10', border: 'border-success/20', icon: ShieldCheck };
      case 'RESTRICT': return { text: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', icon: AlertTriangle };
      case 'ESCALATE': 
      case 'BLOCK':
      case 'TERMINATE':
      case 'TERMINATED': 
           return { text: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20', icon: ShieldAlert };
      default: return { text: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: ShieldCheck };
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Audit Intelligence Register</h2>
        </div>
        <div className="glass-card px-4 py-2 rounded-xl glow-border-blue flex items-center gap-3">
           <div className="flex flex-col">
             <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1 text-right">Active Sessions</span>
             <span className="text-lg font-black text-white italic text-right">{sessions.length}</span>
           </div>
           <div className="w-px h-6 bg-white/5" />
           <div className="p-1.5 bg-primary/10 rounded-lg">
             <Activity size={14} className="text-primary animate-pulse" />
           </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-xl relative group/table">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="overflow-x-auto text-nowrap custom-scrollbar">
          <table className="w-full text-left border-collapse relative z-10">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 animate-shimmer">
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Sequence ID</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Identification</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Trust Quotient</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Protocol Outcome</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">AI Reasoning (Risk Map)</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sessions.map((session, index) => {
                const styles = getDecisionStyles(session.decision);
                const DecisionIcon = styles.icon;
                const isExpanded = !!expandedRows[session.id];
                
                return (
                  <React.Fragment key={session.id}>
                    <tr 
                      className={`group hover:bg-white/[0.03] transition-all cursor-pointer ${isExpanded ? 'bg-white/[0.05]' : ''}`}
                      onClick={(e) => toggleRow(session.id, e)}
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        animation: 'slide-in-from-right-4 0.5s ease-out forwards' 
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-[9px] text-primary font-black tracking-widest bg-primary/5 px-2 py-0.5 rounded border border-primary/10">{session.id}</code>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white italic tracking-tighter uppercase leading-none mb-1.5">{session.userId}</span>
                          <span className="text-[8px] font-mono text-slate-500 group-hover:text-primary transition-colors">{session.ipAddress}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-lg font-black italic tracking-tighter mb-1 ${
                            session.trustScore > 75 ? 'text-success shadow-[0_0_10px_rgba(34,197,94,0.3)]' : session.trustScore > 45 ? 'text-warning' : 'text-danger shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                          }`}>
                            {session.trustScore.toFixed(1)}%
                          </span>
                          <div className="w-16 h-1 bg-white/5 rounded-full mt-0.5 overflow-hidden p-[1px]">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                session.trustScore > 75 ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]' : session.trustScore > 45 ? 'bg-warning' : 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                              }`} 
                              style={{ width: `${session.trustScore}%` }}
                            />
                          </div>
                          <span className="text-[7px] text-slate-600 font-black uppercase tracking-widest mt-1.5">{session.trustScore > 75 ? 'Optimal' : session.trustScore > 45 ? 'Suspicious' : 'Critical'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center text-center">
                          <div className={`px-4 py-1.5 rounded-xl flex items-center gap-2 border backdrop-blur-md transition-all group-hover:scale-105 ${styles.bg} ${styles.border} ${styles.text}`}>
                            <DecisionIcon size={14} className={session.decision === 'ALLOW' ? '' : 'animate-pulse'} />
                            <span className="text-[9px] font-black uppercase tracking-widest italic">{session.decision}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                             <Zap size={12} className={`text-primary ${isExpanded ? 'animate-bounce' : ''}`} />
                             <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full animate-pulse" />
                          </div>
                          <span className="text-[10px] font-black text-slate-300 uppercase italic tracking-tighter group-hover:text-white transition-colors">
                            {session.primaryCause || 'Routine Activity'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-4">
                            <button 
                                onClick={(e) => { e.stopPropagation(); navigate(`/session-explorer?search=${session.id}`); }}
                                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-primary/50 text-slate-500 hover:text-primary transition-all shadow-lg"
                                title="Full Neural Map"
                            >
                                <ArrowRight size={14} />
                            </button>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-primary/20 rotate-180' : 'bg-white/5'}`}>
                              <ChevronDown size={14} className={isExpanded ? 'text-primary' : 'text-slate-600'} />
                            </div>
                         </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-white/[0.02] animate-in fade-in zoom-in-98 duration-500">
                        <td colSpan={6} className="px-10 py-8 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-primary via-primary/50 to-transparent" />
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded-lg">
                                  <Info size={14} className="text-primary" />
                                </div>
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Cognitive Analysis</h4>
                              </div>
                              <div className="glass-card p-6 rounded-[1.5rem] border-white/5 relative overflow-hidden group/card shadow-inner">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/30 group-hover/card:bg-primary transition-all duration-700" />
                                <div className="absolute top-0 right-0 p-3 opacity-5">
                                  <Database size={60} className="text-white" />
                                </div>
                                <p className="text-[12px] text-slate-300 italic leading-relaxed font-medium">
                                  {session.primaryCause ? `Intelligence stream synchronized behavior matching vector: "${session.primaryCause}". ` : "Autonomous baseline established. No anomalous signatures detected. "}
                                  Inference engine predicts a <span className={session.trustScore > 70 ? 'text-success' : 'text-danger'}>{session.trustScore > 70 ? 'nominal' : 'significant'} risk escalation</span> probability based on behavioral entropy within this temporal window.
                                </p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-success/10 rounded-lg">
                                  <ShieldCheck size={14} className="text-success" />
                                </div>
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Intervention Log</h4>
                              </div>
                              <div className="glass-card p-6 rounded-[1.5rem] border-success/10 group/rec shadow-xl bg-success/[0.02]">
                                <div className="flex items-start gap-3 mb-4">
                                  <div className={`p-3 rounded-xl ${session.decision === 'ALLOW' ? 'bg-success/10' : 'bg-danger/10'}`}>
                                    {session.decision === 'ALLOW' ? <ShieldCheck size={18} className="text-success" /> : <ShieldAlert size={18} className="text-danger" />}
                                  </div>
                                  <div>
                                    <p className="text-[13px] text-white font-black italic tracking-tighter leading-tight mb-1">
                                      {session.recommendedAction || "Maintain Passive Observation"}
                                    </p>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest text-nowrap">Actionable Protocol Output</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block mb-0.5">Priority</span>
                                    <span className={`text-[11px] font-black uppercase italic ${session.decision === 'ALLOW' ? 'text-success' : 'text-danger'}`}>
                                      {session.decision === 'ALLOW' ? 'Routine' : 'Critical'}
                                    </span>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block mb-0.5">Confidence</span>
                                    <span className="text-[11px] font-black text-white italic">0.942</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {sessions.length === 0 && (
          <div className="p-20 text-center space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="relative">
              <Database className="w-12 h-12 text-slate-800 mx-auto mb-4 animate-pulse" />
              <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[9px] leading-relaxed max-w-sm mx-auto"> 
                Neural memory bank currently unpopulated. <br/> 
                <span className="text-primary/50 italic capitalize mt-1.5 block font-medium tracking-normal text-xs text-nowrap">Initialize stream to begin autonomous evaluation.</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
