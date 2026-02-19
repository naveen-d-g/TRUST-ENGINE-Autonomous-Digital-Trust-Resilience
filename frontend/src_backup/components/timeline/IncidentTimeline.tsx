
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IncidentSummary } from '../../types/soc';
import { severityTheme, SeverityLevel } from '../../design/severity';
import { listContainerVariants, cardVariants } from '../../design/motion';
import { Link } from 'react-router-dom';
import { Clock, ShieldAlert, Activity } from 'lucide-react';

interface IncidentTimelineProps {
  incidents: IncidentSummary[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ incidents }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-muted-foreground border-b border-border pb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" /> Live Operations Feed
        </h3>
        <span className="text-xs font-mono animate-pulse text-green-500">REAL-TIME</span>
      </div>

      <motion.div 
        className="space-y-3"
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {incidents.map((incident) => {
            const theme = severityTheme[incident.severity as SeverityLevel] || severityTheme.LOW;
            
            return (
              <motion.div
                key={incident.incident_id}
                variants={cardVariants}
                exit="exit"
                layout
                className="relative group block"
              >
                  <Link to={`/soc/incidents/${incident.incident_id}`}>
                    <div 
                        className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors flex items-center justify-between"
                        style={{ borderColor: theme.color + '40' }} // 25% opacity border
                    >
                        <div className="flex items-center gap-4">
                             {/* Severity Indicator */}
                             <div 
                                className="w-2 h-12 rounded-full"
                                style={{ backgroundColor: theme.color, boxShadow: `0 0 10px ${theme.glow}` }}
                             />
                             
                             <div>
                                 <h4 className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                     {incident.title}
                                     {incident.status !== 'OPEN' && (
                                         <span className="text-[10px] uppercase border border-border px-1.5 py-0.5 rounded text-muted-foreground">{incident.status}</span>
                                     )}
                                 </h4>
                                 <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground mt-1">
                                     <span>{incident.incident_id}</span>
                                     <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {incident.domain}</span>
                                     <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(incident.created_at).toLocaleTimeString()}</span>
                                 </div>
                             </div>
                        </div>

                        <div className="text-right">
                             <div className="text-xs text-muted-foreground">SEVERITY</div>
                             <div className="font-bold" style={{ color: theme.color }}>{incident.severity}</div>
                        </div>
                    </div>
                  </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {incidents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                No active incidents. Systems Nominal.
            </div>
        )}
      </motion.div>
    </div>
  );
};
