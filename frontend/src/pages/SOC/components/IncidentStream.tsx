import React from 'react';
import { MotionList } from '../../../motion/MotionList';
import { IncidentSummary } from '../../../types/soc';
import { SeverityBadge } from '../../../components/badges/SeverityBadge';
import { StatusBadge } from '../../../components/badges/StatusBadge';
import { ShieldAlert, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeverityPulse } from '../../../motion/SeverityPulse';
import { SeverityLevel } from '../../../design/severity';
import { Transitions } from '../../../design/motion';
import { motion } from 'framer-motion';

interface IncidentStreamProps {
    incidents: IncidentSummary[];
}

export const IncidentStream: React.FC<IncidentStreamProps> = ({ incidents }) => {
    
    const renderIncident = (inc: IncidentSummary) => {
        const severity = inc.severity as unknown as SeverityLevel;
        
        return (
            <SeverityPulse severity={severity} className="mb-2">
                <Link to={`/soc/incidents?id=${inc.incident_id}`} className="block group">
                    <div className="bg-card hover:bg-muted/50 border border-border/50 rounded-lg p-4 transition-all duration-300 flex items-center justify-between group-hover:border-primary/30">
                        <div className="flex items-center gap-4">
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`p-2 rounded-lg ${severity === SeverityLevel.CRITICAL ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'}`}
                            >
                                {severity === SeverityLevel.CRITICAL ? <ShieldAlert className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                            </motion.div>
                            <div>
                                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{inc.title}</div>
                                <div className="text-[10px] text-muted-foreground font-mono flex gap-2 items-center">
                                    <span className="bg-muted px-1 rounded uppercase">{inc.incident_id}</span>
                                    <span>•</span>
                                    <span className="uppercase">{inc.domain}</span>
                                    <span>•</span>
                                    <span>{new Date(inc.created_at).toLocaleTimeString()}</span> 
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end gap-1">
                                <StatusBadge status={inc.status} />
                                <SeverityBadge severity={inc.severity} />
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                </Link>
            </SeverityPulse>
        );
    };

    return (
        <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-black flex items-center gap-2 tracking-widest text-muted-foreground uppercase">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Live Incident Stream
                </h2>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Real-time Feed Active</span>
                </div>
            </div>
            
            <MotionList 
                items={incidents}
                renderItem={renderIncident}
                keyExtractor={(item) => item.incident_id}
                emptyMessage="No Active Incidents. System Secure."
            />
        </div>
    );
};

