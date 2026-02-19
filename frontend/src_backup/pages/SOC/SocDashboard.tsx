import React from 'react';
import { useLiveStats } from '../../hooks/useLiveStats';
import { useLiveIncidents } from '../../hooks/useLiveIncidents';
import { LiveHeader } from '@/pages/SOC/components/LiveHeader';
import { MetricGrid } from '@/pages/SOC/components/MetricGrid';
import { RiskTimeline } from '@/pages/SOC/components/RiskTimeline';
import { IncidentStream } from '@/pages/SOC/components/IncidentStream';
import { OperatorFocusPanel } from '@/pages/SOC/components/OperatorFocusPanel';

export const SocDashboard: React.FC = () => {
  const { data: stats } = useLiveStats();
  const { data: incidents } = useLiveIncidents();


  if (!stats && !incidents) {
       return (
           <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-primary font-mono text-xl tracking-tighter uppercase">
                    Syncing with Command Center...
                </div>
           </div>
       );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-[1600px] mx-auto overflow-x-hidden">
      {/* SECTION A: GLOBAL LIVE HEADER */}
      <LiveHeader 
        status={stats?.system_status || 'OFFLINE'} 
        lastUpdated={stats?.last_updated || new Date().toLocaleTimeString()} 
      />

      {/* SECTION B: METRIC GRID */}
      <MetricGrid metrics={stats?.metrics || null} />

      {/* SECTION C: RISK VELOCITY TIMELINE */}
      <RiskTimeline dataPoints={[]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SECTION D: INCIDENT STREAM (2/3 width) */}
          <div className="lg:col-span-2">
              <IncidentStream incidents={incidents || []} />
          </div>

          {/* SECTION E: OPERATOR FOCUS PANEL (1/3 width) */}
          <div className="lg:col-span-1">
              <OperatorFocusPanel focus={stats?.operator_focus || null} />
          </div>
      </div>
    </div>
  );
};


export default SocDashboard;

