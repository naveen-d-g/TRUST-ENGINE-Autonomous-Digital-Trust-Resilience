import React, { useEffect } from 'react';
import { useIncidentStore } from '../../store/incidentStore';
import { IncidentModel } from '../../types/models';
import { can } from '../../core/permissions/permissionUtils';
import { Permissions } from '../../core/permissions/permissions';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { SeverityBadge } from '../../components/badges/SeverityBadge';
import { Link } from 'react-router-dom';
import { Clock, ShieldAlert, Zap, Filter, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transitions } from '../../design/motion';

export const Incidents: React.FC = () => {
  const { incidents, loading, error, fetch } = useIncidentStore();

  // Fetch incidents on mount
  useEffect(() => {
    fetch();
  }, [fetch]);

  // Loading state
  if (loading && (!incidents || incidents.length === 0)) {
      return (
          <div className="min-h-[60vh] flex items-center justify-center font-mono text-primary animate-pulse">
              COLLECTING INCIDENT DATA...
          </div>
      );
  }

  // Error state
  if (error) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div className="text-center">
                  <div className="font-mono text-sm text-red-500 mb-2">INCIDENT FETCH FAILED</div>
                  <div className="text-xs text-muted-foreground mb-4">{error}</div>
                  <button 
                      onClick={() => fetch()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition font-mono text-xs"
                  >
                      RETRY
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
        <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-primary" />
                Active Incidents
            </h1>
            <p className="text-xs font-mono text-muted-foreground mt-1 uppercase tracking-[0.2em]">{incidents?.length || 0} Records In Buffer</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                    type="text" 
                    placeholder="Search incident ID, title..." 
                    className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
            </div>
            <button className="p-2 bg-muted/50 border border-border/50 rounded-lg hover:bg-muted transition-colors">
                <Filter className="w-4 h-4 text-muted-foreground" />
            </button>
        </div>
      </div>

      <div className="bg-card/40 border border-border/50 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
            <thead>
                <tr className="bg-muted/50 border-b border-border/50">
                <th className="px-6 py-4 font-mono text-[10px] font-black text-muted-foreground uppercase tracking-widest">Incident ID</th>
                <th className="px-6 py-4 font-mono text-[10px] font-black text-muted-foreground uppercase tracking-widest">Classification</th>
                <th className="px-6 py-4 font-mono text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Severity</th>
                <th className="px-6 py-4 font-mono text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 font-mono text-[10px] font-black text-muted-foreground uppercase tracking-widest">Impact Scope</th>
                <th className="px-6 py-4 font-mono text-[10px] font-black text-muted-foreground uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
                <AnimatePresence mode="popLayout">
                    {(incidents || []).map((inc: IncidentModel, idx: number) => (
                    <motion.tr 
                        key={inc.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ ...Transitions.smooth, delay: idx * 0.03 }}
                        className="hover:bg-primary/[0.03] transition-colors group cursor-pointer"
                    >
                        <td className="px-6 py-4 font-mono text-xs font-bold text-primary">{inc.id}</td>
                        <td className="px-6 py-4">
                            <div className="font-bold text-foreground group-hover:text-primary transition-colors">{inc.title}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-mono mt-0.5">{inc.sessionId}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <SeverityBadge severity={inc.severity} />
                        </td>
                        <td className="px-6 py-4">
                            <StatusBadge status={inc.status} />
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded w-fit">
                                SESSION: {inc.sessionId}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 opacity-50" />
                                <span>{new Date(inc.createdAt).toLocaleString()}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            {can(Permissions.VIEW_INCIDENTS) && (
                              <Link 
                                  to={`/soc/incidents/${inc.id}`}
                                  className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                              >
                                  <Zap className="w-4 h-4" />
                              </Link>
                            )}
                        </td>
                    </motion.tr>
                    ))}
                </AnimatePresence>
                {(!incidents || incidents.length === 0) && (
                <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <ShieldAlert className="w-12 h-12 text-muted-foreground/30" />
                        <div className="text-sm font-mono text-muted-foreground/50 uppercase tracking-widest">
                            No Active Incidents Detected in Buffer
                        </div>
                    </div>
                    </td>
                </motion.tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Incidents;

