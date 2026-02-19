
import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  RefreshCw,
  Activity
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import StatCard from '../components/cards/StatCard';
import DecisionDistributionChart from '../components/charts/DecisionDistributionChart';
import RiskCausesChart from '../components/charts/RiskCausesChart';
import TrustEvolutionChart from '../components/charts/TrustEvolutionChart';
import RiskDomainChart from '../components/charts/RiskDomainChart';

const Dashboard = () => {
  const { summary, loading, error, refreshData, lastUpdated } = useAppContext();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <RefreshCw className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Synchronizing with Trust Engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 text-center max-w-xl mx-auto">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">Operational Interruption</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button 
          onClick={refreshData}
          className="bg-destructive text-destructive-foreground px-6 py-2 rounded-lg font-bold hover:bg-destructive/80 transition-colors"
        >
          Re-establish Connection
        </button>
      </div>
    );
  }

  const stats = [
    { 
      title: 'Avg Trust Score', 
      value: `${summary?.average_trust_score?.toFixed(1) || 0}%`, 
      icon: ShieldCheck, 
      color: 'success' 
    },
    { 
      title: 'Bot:Attack Ratio', 
      value: summary?.bot_vs_attack_ratio?.toFixed(2) || '0.00', 
      icon: Users, 
      color: 'primary' 
    },
    { 
      title: 'Total Sessions', 
      value: Object.values(summary?.decision_distribution || {}).reduce((a, b) => a + b, 0).toLocaleString(), 
      icon: Activity, 
      color: 'warning' 
    },
    { 
      title: 'Detection Sensitivity', 
      value: 'High', 
      icon: AlertTriangle, 
      color: 'danger' 
    },
  ];

  return (
    <div className="space-y-8 pb-12 transition-colors">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Executive Intelligence</h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-success/10 border border-success/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-success uppercase tracking-widest">Live</span>
            </div>
          </div>
          <p className="text-muted-foreground">Real-time analytical overview of digital trust decisions.</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="text-right">
              <span className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Sync Integrity</span>
              <span className="text-xs text-muted-foreground/80 font-medium">Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
          <button 
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-bold border border-border/50 transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">Decision Distribution</h3>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Policy Application</span>
          </div>
          <DecisionDistributionChart data={summary?.decision_distribution} height="300px" />
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">Primary Risk Vectors</h3>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Cause Analysis</span>
          </div>
          <RiskCausesChart causes={summary?.top_risk_causes} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">Domain Risk Breakdown</h3>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Threat Surface</span>
            </div>
            <RiskDomainChart data={summary?.domain_risk} />
         </div>

         <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-foreground">Trust Score Evolution</h3>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Temporal Intelligence (24H)</span>
            </div>
            <p className="text-muted-foreground text-xs mb-4">Baseline stability monitoring for automated decisioning thresholds.</p>
            <TrustEvolutionChart data={summary?.trust_evolution} />
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
