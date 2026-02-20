import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { incidentApi } from '../../api/incident.api';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { SeverityBadge } from '../../components/badges/SeverityBadge';
import { IncidentDetailResponse } from '../../types/soc';
import { ArrowLeft, Target, Shield, Activity, Clock, Zap, Play, FastForward, Globe, AlertCircle } from 'lucide-react';
import { MotionCard } from '../../motion/MotionCard';
import { SeverityPulse } from '../../motion/SeverityPulse';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveIncidentStream } from '../../hooks/useLiveIncidentStream';
import { useSocKeyboard } from '../../hooks/useSocKeyboard';
import { DangerButton } from '../../components/DangerButton';

import { DecisionMatrix } from '@/pages/SOC/components/DecisionMatrix';
import { Transitions } from '../../design/motion';

export const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: incident, isLoading } = useQuery({
      queryKey: ['soc', 'incidents', id],
      queryFn: () => incidentApi.getById(id!),
      enabled: !!id
  });

  useLiveIncidentStream(id);

  useSocKeyboard([
    { key: 'Escape', action: () => console.log('Esc pressed') } 
  ]);

  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh] font-mono text-primary animate-pulse tracking-widest text-sm">
              <Activity className="w-5 h-5 mr-3 animate-spin" />
              RETRIEVING INCIDENT_MANIFEST_{id || 'NULL'}...
          </div>
      );
  }

  if (!incident) {
      return (
        <div className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500/30 mx-auto mb-4" />
            <div className="text-xl font-black text-red-500 font-mono tracking-tighter uppercase">Incident Context Fragmented</div>
            <p className="text-muted-foreground text-sm font-mono mt-2">UUID {id} not found in active operational buffer.</p>
            <Link to="/soc/incidents" className="mt-8 inline-block px-6 py-2 bg-muted hover:bg-muted/80 rounded font-mono text-xs uppercase tracking-widest transition-colors">Return to Ops</Link>
        </div>
      );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 pb-20 overflow-x-hidden">
      {/* Navigation Header */}
      <div className="flex justify-between items-end border-b border-border/50 pb-6">
        <div>
            <Link to="/soc/incidents" className="text-[10px] font-mono text-muted-foreground hover:text-primary flex items-center transition-colors uppercase tracking-[0.2em] mb-2">
                <ArrowLeft className="w-3 h-3 mr-2" /> Back to Operations Control
            </Link>
            <h1 className="text-4xl font-black tracking-tighter uppercase bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
                Incident Detail
            </h1>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-full border border-border/50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">Live Metadata Stream</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Main Context Area */}
          <div className="xl:col-span-8 space-y-6">
              {/* PRIMARY HEADER CARD */}
              <SeverityPulse severity={incident.severity}>
                  <MotionCard className="border-none bg-card/60 backdrop-blur-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                          <Zap className="w-32 h-32" />
                      </div>
                      
                      <div className="relative z-10">
                          <div className="flex flex-wrap items-center gap-4 mb-4">
                              <span className="px-2 py-1 bg-primary text-primary-foreground text-[10px] font-mono font-black rounded uppercase tracking-widest">
                                  {incident.incident_id}
                              </span>
                              <SeverityBadge severity={incident.severity} />
                              <StatusBadge status={incident.status} />
                          </div>
                          
                          <h2 className="text-3xl font-black tracking-tight mb-2 leading-none uppercase">{incident.summary}</h2>
                          
                          <div className="flex flex-wrap items-center gap-6 font-mono text-[10px] text-muted-foreground tracking-widest uppercase mt-4">
                              <span className="flex items-center gap-2 text-primary/80">
                                  <Globe className="w-3 h-3" /> {incident.domain} SECURITY
                              </span>
                              <span className="flex items-center gap-2">
                                  <Clock className="w-3 h-3" /> {new Date(incident.created_at).toLocaleString()}
                              </span>
                          </div>
                      </div>
                  </MotionCard>
              </SeverityPulse>

              {/* DECISION MATRIX */}
              <DecisionMatrix decisions={incident.decisions} />

              {/* OPERATIONAL TIMELINE */}
              <MotionCard delay={0.1}>
                   <div className="flex items-center justify-between mb-8 border-b border-border/30 pb-4">
                       <h3 className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                           <Activity className="w-4 h-4 text-primary" /> 
                           Operational Event Log
                       </h3>
                       <div className="flex gap-1">
                           <button className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors"><Play className="w-3 h-3" /></button>
                           <button className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors"><FastForward className="w-3 h-3" /></button>
                       </div>
                   </div>
                   
                   <div className="relative border-l border-border/50 ml-4 space-y-10 pl-10 py-2">
                       <AnimatePresence mode="popLayout">
                           {/* Combine and sort actions + decisions for a true timeline */}
                           {([...incident.decisions.map(d => ({ ...d, itemKind: 'DECISION' as const })), 
                             ...incident.enforcement_actions.map(a => ({ ...a, itemKind: 'ENFORCEMENT' as const, timestamp: new Date(incident.created_at).toISOString() }))] as any[])
                             .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                             .map((item, idx) => {
                               if (item.itemKind === 'ENFORCEMENT') {
                                 const a = item as IncidentDetailResponse['enforcement_actions'][number] & { timestamp: string; itemKind: 'ENFORCEMENT' };
                                 return (
                                   <motion.div 
                                        key={idx} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ ...Transitions.smooth, delay: idx * 0.05 }}
                                        className="relative group"
                                   >
                                       <div className="absolute -left-[53px] w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center transition-all duration-300 group-hover:scale-110 border-red-500/50">
                                           <Shield className="w-3 h-3 text-red-500" />
                                       </div>
                                       <div className="bg-muted/10 p-5 rounded-xl border border-border/30 group-hover:bg-muted/20 transition-all">
                                           <div className="flex justify-between items-start mb-3">
                                               <div className="flex flex-col">
                                                   <span className="text-[10px] font-mono font-black uppercase tracking-widest text-red-400">
                                                       ACT-O: {a.type}
                                                   </span>
                                                   <span className="text-xs text-muted-foreground font-mono opacity-50 mt-0.5">
                                                       {new Date(a.timestamp).toLocaleTimeString()}
                                                   </span>
                                               </div>
                                               <StatusBadge status={a.status} className="text-[9px]" />
                                           </div>
                                           <div className="text-sm text-foreground/90 leading-relaxed">
                                               {a.justification || `Executing high-entropy ${a.type} policy.`}
                                           </div>
                                       </div>
                                   </motion.div>
                                 );
                               } else {
                                 const d = item as IncidentDetailResponse['decisions'][number] & { itemKind: 'DECISION' };
                                 return (
                                   <motion.div 
                                        key={idx} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ ...Transitions.smooth, delay: idx * 0.05 }}
                                        className="relative group"
                                   >
                                       <div className="absolute -left-[53px] w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center transition-all duration-300 group-hover:scale-110 border-primary/50">
                                           <div className="w-2 h-2 rounded-full bg-primary" />
                                       </div>
                                       <div className="bg-muted/10 p-5 rounded-xl border border-border/30 group-hover:bg-muted/20 transition-all">
                                           <div className="flex justify-between items-start mb-3">
                                               <div className="flex flex-col">
                                                   <span className="text-[10px] font-mono font-black uppercase tracking-widest text-primary/80">
                                                       DEC-O: {d.decision}
                                                   </span>
                                                   <span className="text-xs text-muted-foreground font-mono opacity-50 mt-0.5">
                                                       {new Date(d.timestamp).toLocaleTimeString()}
                                                   </span>
                                               </div>
                                           </div>
                                           <div className="text-sm text-foreground/90 leading-relaxed">
                                               {d.explanation.join('; ')}
                                           </div>
                                           <div className="mt-4 pt-3 border-t border-border/20 flex gap-4">
                                               <div className="text-[10px] font-mono">
                                                   <span className="text-muted-foreground uppercase opacity-50">Risk:</span>
                                                   <span className="ml-2 font-bold">{d.risk_score}%</span>
                                               </div>
                                           </div>
                                       </div>
                                   </motion.div>
                                 );
                               }
                             })}
                       </AnimatePresence>
                       
                       {incident.decisions.length === 0 && incident.enforcement_actions.length === 0 && (
                           <div className="text-muted-foreground text-xs font-mono uppercase tracking-widest animate-pulse">Waiting for initial telemetry pulses...</div>
                       )}
                   </div>
              </MotionCard>
          </div>

          {/* Action & Sidebar Area */}
          <div className="xl:col-span-4 space-y-6">
              {/* TARGETS CARD */}
              <MotionCard delay={0.2}>
                  <h3 className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                       <Target className="w-4 h-4 text-red-500" /> Affected Vectors
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Primary Principals</div>
                          <div className="flex flex-wrap gap-2">
                              {incident.involved_entities.users.map(u => (
                                  <div key={u} className="px-3 py-1.5 bg-muted/30 border border-border/50 rounded text-xs font-mono font-bold flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_#ef4444]" />
                                      {u}
                                  </div>
                              ))}
                              {incident.involved_entities.users.length === 0 && <span className="text-[10px] font-mono text-muted-foreground opacity-30">SCAN_NEGATIVE</span>}
                          </div>
                      </div>
                      
                      <div className="pt-4 border-t border-border/10">
                          <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Network Terminals (IP)</div>
                          <div className="flex flex-wrap gap-2">
                              {incident.involved_entities.ips.map(ip => (
                                  <div key={ip} className="px-3 py-1.5 bg-muted/30 border border-border/50 rounded text-xs font-mono opacity-80 hover:opacity-100 transition-opacity">
                                      {ip}
                                  </div>
                              ))}
                               {incident.involved_entities.ips.length === 0 && <span className="text-[10px] font-mono text-muted-foreground opacity-30">SCAN_NEGATIVE</span>}
                          </div>
                      </div>
                  </div>
              </MotionCard>

              {/* ENFORCEMENT CONTROL PANEL */}
              <MotionCard delay={0.3} className="border-t-4 border-t-red-600 bg-red-600/[0.02]">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="text-[10px] font-mono font-black flex items-center gap-2 uppercase tracking-widest text-red-500">
                          <Shield className="w-5 h-5" /> Enforcement Control
                      </h3>
                  </div>

                  <div className="space-y-4">
                      {incident.enforcement_actions.filter(a => a.status === 'PROPOSED').map(action => (
                          <div key={action.action_id} className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl group">
                              <div className="font-black text-xs text-red-500 mb-1 uppercase tracking-widest">{action.type}</div>
                              <div className="text-[10px] text-muted-foreground mb-4 font-mono opacity-50 uppercase tracking-widest">Target Scope: {action.scope}</div>
                              <Link to={`/soc/proposals?pid=${action.action_id.split('-')[0]}`} className="w-full block">
                                  <button className="w-full py-2.5 bg-background border border-border/50 rounded font-mono text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                                      Review Directive
                                  </button>
                              </Link>
                          </div>
                      ))}
                      
                      {incident.enforcement_actions.every(a => a.status !== 'PROPOSED') && (
                          <div className="text-center p-8 text-muted-foreground border border-dashed border-border/50 rounded-xl text-[10px] font-mono uppercase tracking-widest opacity-50">
                              No Pending Directives
                          </div>
                      )}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-border/30">
                      <h4 className="text-[10px] font-mono font-black text-muted-foreground uppercase mb-4 opacity-50">Tactical Overrides</h4>
                      <DangerButton 
                          actionName="INITIATE_LOCKDOWN"
                          blastRadius="TERMINATE ALL ACTIVE SESSIONS AND REVOKE TOKEN ACCESS IMMEDIATELY."
                          onConfirm={() => alert('LOCKDOWN_SEQUENCE_STARTED')}
                          className="w-full mb-3 py-3 font-black tracking-widest text-[11px]"
                      />
                      <button className="w-full py-2 text-[10px] font-mono text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors">
                          Operational Recovery Docs
                      </button>
                  </div>
              </MotionCard>
          </div>
      </div>
    </div>
  );
};

export default IncidentDetail;

