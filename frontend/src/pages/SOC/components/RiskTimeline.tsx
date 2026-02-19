import React from 'react';
import { MotionCard } from '../../../motion/MotionCard';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tokens } from '../../../design/tokens';

interface RiskTimelineProps {
    dataPoints: number[]; // Array of risk scores or velocity
}

export const RiskTimeline: React.FC<RiskTimelineProps> = ({ dataPoints = [] }) => {
    const points = dataPoints.length > 0 ? dataPoints : [10, 12, 15, 14, 18, 20, 22, 19, 25, 30, 28, 35, 32, 40, 42, 38, 45, 50, 48, 55, 60, 58, 65, 70];
    
    const width = 1000;
    const height = 100;
    const max = Math.max(...points, 100);
    const min = Math.min(...points, 0);
    
    const pathD = points.map((p, i) => {
        const x = (i / (points.length - 1)) * width;
        const y = height - ((p - min) / (max - min)) * height;
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

    const lastPoint = points[points.length - 1];
    const isHighRisk = lastPoint > 50;

    return (
        <MotionCard className="mb-6 p-4 relative overflow-hidden" delay={0.4}>
            {/* Scanline Effect Overlay */}
            <motion.div 
               className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-primary/5 to-transparent z-10"
               animate={{ y: ['-100%', '100%'] }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            <div className="flex items-center justify-between mb-4 relative z-20">
                <h3 className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    RISK VELOCITY TIMELINE (24H)
                </h3>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">Live Link Active</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded font-mono ${isHighRisk ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        {lastPoint.toFixed(1)}
                    </span>
                </div>
            </div>
            
            <div className="h-24 w-full relative overflow-visible">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="riskGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={Tokens.colors.severity.low} />
                            <stop offset="50%" stopColor={Tokens.colors.severity.medium} />
                            <stop offset="100%" stopColor={Tokens.colors.severity.critical} />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    
                    <motion.path
                        d={pathD}
                        fill="none"
                        stroke="url(#riskGradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        filter="url(#glow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    />
                    
                    <motion.circle
                        cx={( (points.length - 1) / (points.length - 1) ) * width}
                        cy={height - ((lastPoint - min) / (max - min)) * height}
                        r="3"
                        fill={isHighRisk ? Tokens.colors.severity.critical : Tokens.colors.severity.low}
                        animate={{ r: [3, 6, 3], opacity: [1, 0.4, 1], filter: ['blur(0px)', 'blur(4px)', 'blur(0px)'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </svg>
            </div>
        </MotionCard>
    );
};

