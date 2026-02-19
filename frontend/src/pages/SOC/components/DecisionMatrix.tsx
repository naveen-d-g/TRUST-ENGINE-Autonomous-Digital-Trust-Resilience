import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Tokens } from '../../../design/tokens';
import { Transitions } from '../../../design/motion';

interface Decision {
    timestamp: string;
    risk_score: number;
    decision: 'ALLOW' | 'MONITOR' | 'RESTRICT' | 'ESCALATE';
    explanation: string[];
}

interface DecisionMatrixProps {
    decisions: Decision[];
}

export const DecisionMatrix: React.FC<DecisionMatrixProps> = ({ decisions }) => {
    if (decisions.length === 0) return null;

    const latest = decisions[decisions.length - 1];

    const getDecisionConfig = (decision: string) => {
        switch (decision) {
            case 'ALLOW': return { icon: CheckCircle2, color: Tokens.colors.success, text: 'System Clear' };
            case 'MONITOR': return { icon: AlertTriangle, color: Tokens.colors.monitor, text: 'Active Observation' };
            case 'RESTRICT': return { icon: Shield, color: Tokens.colors.restrict, text: 'Access Cordoned' };
            case 'ESCALATE': return { icon: XCircle, color: Tokens.colors.escalate, text: 'Total Lockdown' };
            default: return { icon: Shield, color: Tokens.colors.primary, text: 'Pending' };
        }
    };

    const config = getDecisionConfig(latest.decision);

    return (
        <div className="bg-card/40 border border-border/50 rounded-xl overflow-hidden backdrop-blur-md">
            <div className="p-4 bg-muted/20 border-b border-border/50 flex items-center justify-between">
                <h3 className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest">Autonomous Decision Matrix</h3>
                <div className="text-[10px] font-mono text-primary font-bold">VERIFIED_AI_DECISION</div>
            </div>
            
            <div className="p-6">
                <div className="flex items-center gap-6 mb-8">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-4 rounded-2xl border-2"
                        style={{ borderColor: config.color, backgroundColor: `${config.color}10` }}
                    >
                        <config.icon className="w-12 h-12" style={{ color: config.color }} />
                    </motion.div>
                    <div>
                        <div className="text-3xl font-black tracking-tighter uppercase" style={{ color: config.color }}>{latest.decision}</div>
                        <div className="text-xs font-mono text-muted-foreground mt-1 uppercase tracking-widest">{config.text}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase mb-2">Confidence Indicators</div>
                    <div className="flex gap-2">
                        {latest.explanation.map((reason, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="px-3 py-1.5 bg-muted/50 border border-border/50 rounded-lg text-xs font-medium text-foreground/80"
                            >
                                {reason}
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border/30">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase mb-1">Risk Composite</div>
                            <div className="text-2xl font-black font-mono" style={{ color: latest.risk_score > 70 ? Tokens.colors.severity.critical : Tokens.colors.primary }}>
                                {latest.risk_score.toFixed(1)}%
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase mb-1">State Validity</div>
                             <div className="text-xs font-mono text-green-500 font-bold">STABLE_EQUILIBRIUM</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
