import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Lock, Presentation, MonitorPlay } from 'lucide-react';

export const Demo: React.FC = () => {
  const { user } = useAuth();
  
  if (user && user.role !== 'viewer') {
      return (
          <div className="p-8 text-center">
              <h1 className="text-xl font-bold">Analyst Access Detected</h1>
              <p className="text-muted-foreground">Please use the live SOC Dashboard.</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center space-y-8">
            <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Presentation className="w-12 h-12 text-primary" />
                </div>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight">Platform Demo</h1>
            <p className="text-xl text-muted-foreground">
                You are viewing the SOC-Grade v2 platform in <span className="text-foreground font-semibold">Viewer Mode</span>.
                Real-time incident response and enforcement actions are disabled.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-6 bg-card border border-border rounded-lg">
                    <MonitorPlay className="w-8 h-8 text-blue-500 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Live Monitoring</h3>
                    <p className="text-sm text-muted-foreground">
                        Observe real-time threat detection and telemetry streams (simulated).
                    </p>
                </div>
                <div className="p-6 bg-card border border-border rounded-lg opacity-75">
                    <Lock className="w-8 h-8 text-amber-500 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Enforcement Restricted</h3>
                    <p className="text-sm text-muted-foreground">
                        Active response capabilities are locked for Viewer roles.
                    </p>
                </div>
                <div className="p-6 bg-card border border-border rounded-lg opacity-75">
                    <Lock className="w-8 h-8 text-red-500 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Recovery Locked</h3>
                    <p className="text-sm text-muted-foreground">
                        Disaster recovery and system override functions are Admin-only.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Demo;
