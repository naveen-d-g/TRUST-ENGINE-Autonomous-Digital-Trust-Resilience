import React from 'react';
import { ShieldCheck, AlertTriangle, Activity, Zap, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionCard } from '../motion/MotionCard';
import { MotionValue } from '../motion/MotionValue';
import { SeverityPulse } from '../motion/SeverityPulse';
import { SeverityLevel } from '../design/severity';
import { Transitions } from '../design/motion';

interface RecentEvent {
  id: string;
  message: string;
  type: 'INFO' | 'WARN' | 'ERROR';
}

interface DomainDashboardProps {
  title: string;
  icon: LucideIcon;
  activeSessions: number;
  highRiskCount: number;
  recentEvents: RecentEvent[];
}

export const DomainDashboard: React.FC<DomainDashboardProps> = ({
  title,
  icon: Icon,
  activeSessions,
  highRiskCount,
  recentEvents
}) => {
  const riskSeverity = highRiskCount > 10 ? SeverityLevel.CRITICAL : 
                       highRiskCount > 5 ? SeverityLevel.HIGH : SeverityLevel.LOW;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <Icon className="w-8 h-8 text-primary" />
            </div>
            <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase">{title} Security</h1>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-1">Domain Monitor Alpha-1</p>
            </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-full border border-border/50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">Live Link</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Column */}
        <div className="lg:col-span-1 space-y-6">
            <MotionCard delay={0}>
                <div className="flex项-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest">Active Traffic</span>
                    <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex items-end justify-between">
                    <div className="text-4xl font-black tracking-tighter">
                        <MotionValue value={activeSessions} />
                    </div>
                    <div className="text-[10px] font-mono text-blue-400 font-bold mb-1">STABLE</div>
                </div>
            </MotionCard>

            <SeverityPulse severity={riskSeverity} className="rounded-xl overflow-hidden">
                <MotionCard className="border-none h-full" delay={0.1}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest">High Risk Targets</span>
                        <AlertTriangle className={`w-4 h-4 ${highRiskCount > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-4xl font-black tracking-tighter">
                            <MotionValue value={highRiskCount} className={highRiskCount > 0 ? 'text-orange-500' : ''} />
                        </div>
                        <div className={`text-[10px] font-mono font-bold mb-1 ${highRiskCount > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                            {highRiskCount > 10 ? 'CRITICAL' : highRiskCount > 0 ? 'ELEVATED' : 'SECURE'}
                        </div>
                    </div>
                </MotionCard>
            </SeverityPulse>
        </div>

        {/* Recent Events Column */}
        <div className="lg:col-span-2">
            <MotionCard delay={0.2} className="h-full p-0 overflow-hidden border-border/50">
                <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                    <h3 className="text-xs font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Live Domain Events
                    </h3>
                    <div className="text-[10px] font-mono text-primary animate-pulse">SYNCING_STREAM</div>
                </div>
                <div className="divide-y divide-border/30 max-h-[400px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                        {recentEvents.map((event, idx) => (
                            <motion.div 
                                key={event.id} 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ ...Transitions.smooth, delay: idx * 0.05 }}
                                className="p-4 hover:bg-muted/30 transition-colors flex items-start gap-4 group"
                            >
                                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 shadow-sm ${
                                    event.type === 'ERROR' ? 'bg-red-500 shadow-red-500/40' : 
                                    event.type === 'WARN' ? 'bg-amber-500 shadow-amber-500/40' : 'bg-blue-500 shadow-blue-500/40'
                                }`} />
                                <div className="flex-1">
                                    <div className="text-sm text-foreground/90 font-medium group-hover:text-primary transition-colors">{event.message}</div>
                                    <div className="text-[10px] font-mono text-muted-foreground mt-1 flex gap-2">
                                        <span className="opacity-50">EV-ID: {event.id.padStart(4, '0')}</span>
                                        <span className="opacity-50">•</span>
                                        <span className="opacity-50">{new Date().toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {recentEvents.length === 0 && (
                        <div className="p-12 text-center">
                            <ShieldCheck className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                            <p className="text-sm font-mono text-muted-foreground/50 uppercase tracking-widest">No Active Threat Vectors</p>
                        </div>
                    )}
                </div>
            </MotionCard>
        </div>
      </div>
    </div>
  );
};

