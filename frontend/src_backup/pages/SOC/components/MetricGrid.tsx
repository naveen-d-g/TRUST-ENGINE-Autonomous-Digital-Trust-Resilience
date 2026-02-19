import React from 'react';
import { MotionCard } from '../../../motion/MotionCard';
import { MotionValue } from '../../../motion/MotionValue';
import { SeverityPulse } from '../../../motion/SeverityPulse';
import { SeverityLevel } from '../../../design/severity';
import { Tokens } from '../../../design/tokens';
import { Users, Shield, Zap, Activity } from 'lucide-react';

interface MetricGridProps {
  metrics: {
    active_sessions: number;
    global_risk_score: number;
    active_incidents: number;
    risk_velocity: number;
  } | null;
}

export const MetricGrid: React.FC<MetricGridProps> = ({ metrics }) => {
    if (!metrics) return null;

    const riskSeverity = metrics.global_risk_score > 80 ? SeverityLevel.CRITICAL : 
                         metrics.global_risk_score > 60 ? SeverityLevel.HIGH :
                         metrics.global_risk_score > 40 ? SeverityLevel.MEDIUM : SeverityLevel.LOW;

    const velocitySeverity = metrics.risk_velocity > 0.8 ? SeverityLevel.CRITICAL :
                             metrics.risk_velocity > 0.4 ? SeverityLevel.HIGH : SeverityLevel.LOW;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MotionCard delay={0}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-muted-foreground">ACTIVE SESSIONS</span>
                    <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">
                    <MotionValue value={metrics.active_sessions} className="text-foreground" />
                </div>
            </MotionCard>

            <SeverityPulse severity={riskSeverity} className="rounded-lg">
                <MotionCard delay={0.1} className="h-full border-none">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-muted-foreground">GLOBAL RISK SCORE</span>
                        <Shield className={`w-4 h-4 transition-colors duration-500`} style={{ color: Tokens.colors.severity[riskSeverity.toLowerCase() as keyof typeof Tokens.colors.severity] }} />
                    </div>
                    <div className="text-2xl font-bold">
                        <MotionValue value={metrics.global_risk_score} suffix="/100" />
                    </div>
                </MotionCard>
            </SeverityPulse>
            
            <SeverityPulse severity={metrics.active_incidents > 0 ? SeverityLevel.HIGH : SeverityLevel.LOW} className="rounded-lg">
                <MotionCard delay={0.2} className="h-full border-none">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-muted-foreground">ACTIVE INCIDENTS</span>
                        <Zap className={`w-4 h-4 ${metrics.active_incidents > 0 ? 'text-orange-500 animate-pulse' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-2xl font-bold">
                        <MotionValue value={metrics.active_incidents} />
                    </div>
                </MotionCard>
            </SeverityPulse>

            <SeverityPulse severity={velocitySeverity} className="rounded-lg">
                <MotionCard delay={0.3} className="h-full border-none">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-muted-foreground">RISK VELOCITY</span>
                        <Activity className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        <MotionValue 
                            value={metrics.risk_velocity} 
                            prefix={metrics.risk_velocity > 0 ? '+' : ''}
                            className={metrics.risk_velocity > 0.5 ? 'text-red-400' : 'text-foreground'}
                        />
                    </div>
                </MotionCard>
            </SeverityPulse>
        </div>
    );
};

