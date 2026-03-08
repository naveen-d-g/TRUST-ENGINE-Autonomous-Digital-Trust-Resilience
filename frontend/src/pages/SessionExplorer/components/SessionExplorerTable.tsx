import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ChevronDown, 
  Info, 
  Activity,
  User,
  Clock,
  ExternalLink,
  Bot
} from 'lucide-react';

interface SessionExplorerTableProps {
  data: any[];
  isLoading: boolean;
}

export const SessionExplorerTable: React.FC<SessionExplorerTableProps> = ({ data, isLoading }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="glass-card rounded-[2rem] p-12 flex flex-col items-center justify-center space-y-4 glow-border-blue min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-8 h-8 bg-primary/10 rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-primary font-black italic uppercase tracking-[0.3em] text-[10px] animate-pulse">
          Synchronizing Intelligence Matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[2rem] overflow-hidden glow-border-blue shadow-2xl animate-in fade-in duration-1000">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-950/50 border-b border-white/5">
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Session Sequence</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Identity Matrix</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic text-center">Neural Risk</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic text-center">Protocol</th>
              <th className="px-6 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((session, idx) => (
              <React.Fragment key={session.session_id}>
                <tr 
                  className={`group transition-all hover:bg-primary/5 cursor-pointer ${expandedRow === session.session_id ? 'bg-primary/5' : ''}`}
                  onClick={() => setExpandedRow(expandedRow === session.session_id ? null : session.session_id)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />
                      <div>
                        <div className="px-2 py-0.5 rounded-md bg-slate-900 border border-white/5 text-[10px] font-black text-white italic tracking-tighter w-fit">
                          {session.session_id}
                        </div>
                        <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1 ml-1 flex items-center gap-1">
                          <Clock size={8} /> {session.last_seen ? new Date(session.last_seen).toLocaleTimeString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-900 rounded-lg border border-white/5 text-slate-400">
                         <User size={14} />
                       </div>
                       <div>
                         <div className="text-xs font-black text-white italic uppercase tracking-tighter">
                           {session.user_id || 'ANONYMOUS'}
                         </div>
                         <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                           {session.ip_address || '0.0.0.0'}
                         </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-block relative">
                       <span className={`text-lg font-black italic tracking-tighter ${session.trust_score < 50 ? 'text-red-500' : 'text-white'}`}>
                         {typeof session.trust_score === 'number' ? Math.round(100 - session.trust_score) : '0'}
                       </span>
                       <div className={`absolute -inset-2 blur-md opacity-20 rounded-full ${session.trust_score < 50 ? 'bg-red-500' : 'bg-primary'}`} />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest italic
                        ${session.final_decision === 'TERMINATED' || session.final_decision === 'BLOCK' ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 
                          session.final_decision === 'ESCALATE' ? 'bg-warning/10 border-warning/30 text-warning shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                          'bg-success/10 border-success/30 text-success shadow-[0_0_10px_rgba(34,197,94,0.2)]'}
                      `}>
                        {session.final_decision === 'TERMINATED' || session.final_decision === 'BLOCK' ? <ShieldAlert size={10} /> : <ShieldCheck size={10} />}
                        {session.final_decision}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 bg-slate-900 rounded-lg border border-white/5 text-slate-500 hover:text-white hover:border-white/20 transition-all">
                         <ExternalLink size={12} />
                       </button>
                       <div className={`p-1 rounded-md transition-transform duration-300 ${expandedRow === session.session_id ? 'rotate-180 text-primary' : 'text-slate-600'}`}>
                         <ChevronDown size={16} />
                       </div>
                    </div>
                  </td>
                </tr>

                {/* Expanded Row Design */}
                {expandedRow === session.session_id && (
                  <tr className="bg-slate-950/30">
                    <td colSpan={5} className="p-0 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                      <div className="px-10 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cognitive Analysis Card */}
                        <div className="lg:col-span-2 space-y-4">
                           <div className="flex items-center gap-2 mb-2">
                              <Info size={12} className="text-primary" />
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Cognitive Analysis</h4>
                           </div>
                           <div className="glass-card p-6 rounded-2xl border-white/5 bg-slate-900/40 relative overflow-hidden group/ana">
                              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/ana:opacity-20 transition-opacity">
                                <Activity size={80} className="text-primary" />
                              </div>
                              <p className="text-sm font-medium text-slate-300 leading-relaxed italic relative z-10">
                                Intelligence stream synchronized behavior matching vector: <span className="text-white font-black">"{session.primary_cause || 'Pattern Analysis In-Progress'}"</span>. 
                                Inferred intent suggests high automated affinity during the temporal observation window.
                              </p>
                              
                              <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-4">
                                {JSON.parse(session.risk_reasons || '[]').map((reason: string, i: number) => (
                                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/50 rounded-lg border border-white/5">
                                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{reason}</span>
                                  </div>
                                ))}
                              </div>
                           </div>
                        </div>

                        {/* Autonomous Intervention Card */}
                        <div className="space-y-4">
                           <div className="flex items-center gap-2 mb-2">
                              <Bot size={12} className="text-purple-400" />
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Autonomous Intervention</h4>
                           </div>
                           <div className="glass-card p-6 rounded-2xl border-purple-500/20 bg-purple-500/5 glow-border-purple h-full">
                              <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                  <ShieldCheck size={20} />
                                </div>
                                <div>
                                  <h5 className="text-xl font-black text-white italic uppercase italic leading-tight tracking-tighter">Standard Passive Monitoring</h5>
                                  <p className="text-[8px] text-purple-400 font-bold uppercase tracking-widest">Protocol Version: 0.92-B</p>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5">
                                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Autonomous Recommendation</p>
                                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">{session.recommended_action || 'No specific recovery action needed. Monitor situation.'}</p>
                                </div>
                                <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5">
                                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Priority Level</p>
                                  <div className="flex items-center gap-2">
                                     <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                     <p className="text-xs font-black text-white italic uppercase tracking-widest">ROUTINE</p>
                                  </div>
                                </div>
                              </div>
                           </div>
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
    </div>
  );
};
