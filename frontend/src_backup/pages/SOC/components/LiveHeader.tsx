import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, ShieldAlert, Globe } from 'lucide-react';
import { Tokens } from '../../../design/tokens';
import { Transitions } from '../../../design/motion';
import { useLiveStore } from '../../../state/liveStore';
import { SystemStatus } from '../../../types/soc';

interface LiveHeaderProps {
  status: SystemStatus;
  lastUpdated: string | number;
}

export const LiveHeader: React.FC<LiveHeaderProps> = ({ status, lastUpdated }) => {
  const { tenantId } = useLiveStore();
  
  const getStatusConfig = () => {
    switch(status) {
      case 'ONLINE': return { color: Tokens.colors.severity.low, pulse: false };
      case 'DEGRADED': return { color: Tokens.colors.severity.medium, pulse: true };
      case 'LOCKDOWN': return { color: Tokens.colors.severity.critical, pulse: true };
      default: return { color: Tokens.colors.muted, pulse: false };
    }
  };

  const config = getStatusConfig();
  const timeStr = typeof lastUpdated === 'number' ? new Date(lastUpdated).toLocaleTimeString() : lastUpdated;

  return (
    <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4 relative overflow-hidden">
      {status === 'LOCKDOWN' && (
        <motion.div 
          className="absolute inset-0 bg-red-500/5 -z-10"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <motion.div 
              animate={config.pulse ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 font-mono text-sm font-black tracking-widest uppercase"
              style={{ color: config.color }}
          >
              {status === 'LOCKDOWN' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              SYSTEM {status}
          </motion.div>
          <span className="text-[10px] text-muted-foreground font-mono mt-1 opacity-70">
              TELEMETRY HEARTBEAT: {timeStr}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-sm border border-border/50 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            <Globe className="w-3 h-3 opacity-50" />
            <span>NODE:</span>
            <span className="text-foreground/80 font-bold">{tenantId || 'GLOBAL'}</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
      </div>
    </div>
  );
};

