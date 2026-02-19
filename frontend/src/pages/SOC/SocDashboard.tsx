import React, { useState } from 'react';
import { useLiveStats } from '../../hooks/useLiveStats';
import { useLiveIncidents } from '../../hooks/useLiveIncidents';
import { useLiveContext } from '../../context/LiveContext';
import { MetricGrid } from '@/pages/SOC/components/MetricGrid';
import { IncidentStream } from '@/pages/SOC/components/IncidentStream';
import { OperatorFocusPanel } from '@/pages/SOC/components/OperatorFocusPanel';
import UnifiedSocMonitor from '@/pages/SOC/UnifiedSocMonitor';
import { 
  Globe, 
  Cpu, 
  Network, 
  Brain, 
  Layers,
  Activity,
  History,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export const SocDashboard: React.FC = () => {
  const { data: stats } = useLiveStats();
  const { data: incidents } = useLiveIncidents();
  const { events } = useLiveContext();
  const [activeTab, setActiveTab] = useState<'unified' | 'web' | 'api' | 'system' | 'network'>('unified');

  if (!stats && !incidents) {
       return (
           <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-primary font-mono text-xl tracking-tighter uppercase">
                    Initializing Enterprise Monitor...
                </div>
           </div>
       );
  }

  const decisionData = [
    { name: 'Allow', value: stats?.metrics?.allow_count || 34, color: '#10b981' },
    { name: 'Restrict', value: stats?.metrics?.restrict_count || 12, color: '#f59e0b' },
    { name: 'Escalate', value: stats?.metrics?.escalate_count || 5, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-6 max-w-[1800px] mx-auto overflow-x-hidden font-sans">
      {/* GLOBAL ENTERPRISE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Trust Engine <span className="text-slate-500">v2.4 Enterprise</span>
            </h1>
            <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Operational</span>
                </div>
                <div className="w-px h-3 bg-slate-800" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                    Node: {stats?.metrics?.active_node || "US-EAST-01"}
                </span>
            </div>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-slate-900/50 border border-slate-800 rounded-xl">
            {(['unified', 'web', 'api', 'system', 'network'] as const).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === tab 
                        ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {tab === 'unified' && <Layers className="w-3.5 h-3.5" />}
                        {tab === 'web' && <Globe className="w-3.5 h-3.5" />}
                        {tab === 'api' && <Brain className="w-3.5 h-3.5" />}
                        {tab === 'system' && <Cpu className="w-3.5 h-3.5" />}
                        {tab === 'network' && <Network className="w-3.5 h-3.5" />}
                        {tab}
                    </div>
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
          {/* STATS STRIP */}
          <div className="xl:col-span-3">
              <MetricGrid metrics={stats?.metrics || null} />
          </div>

          {/* DECISION DONUT */}
          <div className="xl:col-span-1 bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Policy Decisions</span>
                   <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                            data={decisionData}
                            innerRadius={35}
                            outerRadius={50}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            {decisionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                          />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                   {decisionData.map(d => (
                       <div key={d.name}>
                           <div className="text-xs font-black text-white">{d.value}</div>
                           <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{d.name}</div>
                       </div>
                   ))}
              </div>
          </div>
      </div>

      {activeTab === 'unified' ? (
          <UnifiedSocMonitor />
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                   <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px]">
                        <Activity className="w-12 h-12 text-slate-700 mb-4 animate-pulse" />
                        <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">
                            {activeTab} Monitoring Active
                        </h3>
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-2 max-w-xs text-center">
                            Intercepting and analyzing live {activeTab} signals from distributed collectors.
                        </p>
                   </div>
                   <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Latest {activeTab} Activity</span>
                            <History className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="space-y-4">
                            {events
                                .filter((e: any) => e.domain?.toLowerCase() === activeTab || (activeTab === 'web' && e.event_type === 'http'))
                                .slice(0, 10)
                                .map((e: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                                            <span className="text-[8px] font-black">{e.event_type?.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-slate-300">{e.raw_features?.path || e.actor_id}</div>
                                            <div className="text-[8px] font-bold text-slate-500 uppercase">{e.event_type}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] font-black text-blue-400">{e.intel?.decision || 'ALREADY EVALUATED'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                   </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                  <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6">
                      <div className="flex items-center gap-2 mb-6">
                           <AlertCircle className="w-4 h-4 text-amber-500" />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Correlated Incidents</span>
                      </div>
                      <IncidentStream incidents={incidents || []} />
                  </div>
                  <OperatorFocusPanel focus={stats?.operator_focus || null} />
              </div>
          </div>
      )}
    </div>
  );
};


export default SocDashboard;

