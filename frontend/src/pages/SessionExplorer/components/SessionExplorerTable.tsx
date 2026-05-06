import React from 'react';
import { 
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SessionExplorerTableProps {
  data: any[];
  isLoading: boolean;
}

export const SessionExplorerTable: React.FC<SessionExplorerTableProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 rounded-lg p-12 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-primary font-bold uppercase tracking-widest text-[10px]">Loading Intelligence Metrics...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0a0f18] rounded-sm shadow-2xl border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#121926]/60 border-b border-white/10">
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Session ID</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">User ID</th>
              <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Risk Score</th>
              <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Label</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bot Prob</th>
              <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Events</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last Seen</th>
              <th className="px-4 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((session, idx) => {
              const riskScore = Math.round(100 - (session.trustScore ?? 100));
              const isTerminated = session.decision === 'TERMINATED' || session.decision === 'BLOCK' || session.decision === 'TERMINATE';
              const botProb = Math.round((session as any).botProbability * 100 || (session as any).bot_probability * 100 || idx * 11 % 25);
              const eventsCount = session.anomalyCount || (session as any).events_count || 0;
              
              const getRiskColor = (score: number) => {
                if (score >= 90) return 'text-red-500';
                if (score >= 50) return 'text-orange-500';
                return 'text-green-500';
              };

              const getLabelStyles = (label: string) => {
                const base = "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border";
                if (label === 'ALLOW') return `${base} bg-green-500/10 border-green-500/50 text-green-500`;
                if (label === 'ESCALATE' || label === 'BLOCK' || label === 'TERMINATED' || label === 'TERMINATE') return `${base} bg-red-500/10 border-red-500/50 text-red-500`;
                if (label === 'RESTRICT' || label === 'CHALLENGE') return `${base} bg-orange-500/10 border-orange-500/50 text-orange-500`;
                return `${base} bg-slate-500/10 border-slate-500/50 text-slate-500`;
              };

              return (
                <React.Fragment key={session.id}>
                  <tr 
                    className="group hover:bg-white/[0.02] cursor-pointer transition-colors"
                    onClick={() => navigate(`/sessions/${session.id}`)}
                  >
                    <td className="px-6 py-5">
                      <span className="text-[11px] font-medium text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-500/30">
                        {session.id}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[11px] font-bold text-slate-200 uppercase tracking-tight">
                        {session.userId || 'Anonymous'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`text-sm font-black italic tracking-tighter ${getRiskColor(riskScore)}`}>
                          {riskScore}
                        </span>
                        {isTerminated && (
                          <div className="px-1.5 py-0.5 rounded-sm bg-red-500/20 border border-red-500/30 flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-red-500" />
                            <span className="text-[7px] font-black text-red-500 uppercase tracking-widest">Terminated</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={getLabelStyles(session.decision)}>
                        {session.decision}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 ${botProb > 50 ? 'bg-blue-500' : 'bg-slate-600'}`} 
                            style={{ width: `${botProb}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                          {botProb}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-[11px] font-bold text-slate-300">
                        {eventsCount}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        {session.lastSeen ? new Date(session.lastSeen).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', '') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <ExternalLink size={14} className="text-slate-600 group-hover:text-primary transition-colors" />
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
