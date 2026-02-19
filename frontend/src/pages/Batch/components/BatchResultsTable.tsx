import React from 'react';
import { useSessionStore } from '../../../store/sessionStore';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BatchResultsTable: React.FC = () => {
  const { sessions } = useSessionStore();
  const navigate = useNavigate();

  const getDecisionStyles = (decision: string) => {
    switch (decision) {
      case 'ALLOW': return { text: 'text-success', bg: 'bg-success/10', border: 'border-success/20', icon: ShieldCheck };
      case 'RESTRICT': return { text: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20', icon: ShieldAlert };
      case 'ESCALATE': return { text: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', icon: AlertTriangle };
      default: return { text: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: ShieldCheck };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-white italic tracking-tighter">Audit Intelligence Register</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mr-3">Session Count</span>
           <span className="text-sm font-black text-white italic">{sessions.length}</span>
        </div>
      </div>

      <div className="bg-card/20 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Session ID</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Subject</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">Trust Level</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">Outcome</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Primary Risk Vector</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {sessions.map((session) => {
                const styles = getDecisionStyles(session.decision);
                const DecisionIcon = styles.icon;
                
                return (
                  <tr 
                    key={session.id} 
                    onClick={() => navigate(`/sessions/${session.id}`)}
                    className="group hover:bg-slate-800/40 transition-all cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <code className="text-[11px] text-slate-400 font-bold group-hover:text-primary transition-colors">{session.id}</code>
                    </td>
                    <td className="px-8 py-6 flex flex-col">
                      <span className="text-xs font-black text-white italic tracking-tight uppercase leading-none mb-1">{session.userId}</span>
                      <span className="text-[10px] font-mono text-slate-600">{session.ipAddress}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-lg font-black italic tracking-tighter ${
                          session.trustScore > 75 ? 'text-success' : session.trustScore > 45 ? 'text-warning' : 'text-danger'
                        }`}>
                          {session.trustScore.toFixed(1)}%
                        </span>
                        <div className="w-16 h-1 bg-slate-800 rounded-full mt-1">
                          <div 
                            className={`h-full rounded-full ${
                              session.trustScore > 75 ? 'bg-success' : session.trustScore > 45 ? 'bg-warning' : 'bg-danger'
                            }`} 
                            style={{ width: `${session.trustScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center text-center">
                        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${styles.bg} ${styles.border} ${styles.text}`}>
                          <DecisionIcon size={14} className="animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest italic">{session.decision}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-300 uppercase italic tracking-tight">
                        {session.threatLevel || 'Minor Anomaly'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-primary group-hover:text-white text-slate-600 transition-all">
                         <ArrowRight size={16} />
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {sessions.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <Database className="w-12 h-12 text-slate-800 mx-auto" />
            <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-xs leading-relaxed"> No dataset intelligence currently residing in ephemeral memory. <br/> Initialize a new stream to begin. </p>
          </div>
        )}
      </div>
    </div>
  );
};
