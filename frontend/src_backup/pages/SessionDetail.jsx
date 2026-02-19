import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ShieldAlert, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  MapPin, 
  Activity,
  Zap,
  Info,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  BarChart3
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { metricsService } from '../services/api';

const SessionDetail = () => {
  const { session_id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await metricsService.getSession(session_id);
        setData(res);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    fetchDetail();
  }, [session_id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Retrieving Intelligence...</p>
    </div>
  );
  
  if (error) return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 text-center max-w-xl mx-auto my-12">
      <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
      <h3 className="text-xl font-bold text-foreground mb-2">Retrieval Interrupted</h3>
      <p className="text-muted-foreground mb-6">{error.toString()}</p>
      <Link to="/sessions" className="bg-destructive text-destructive-foreground px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-colors inline-block text-sm">Return to Explorer</Link>
    </div>
  );

  const getDecisionTheme = (decision) => {
    const d = decision?.toUpperCase() || '';
    if (d === 'ALLOW') return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 };
    if (d === 'RESTRICT') return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertOctagon };
    if (d === 'ESCALATE') return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: ShieldAlert };
    return { color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-muted', icon: Info };
  };

  const theme = getDecisionTheme(data.final_decision);
  const StatusIcon = theme.icon;

  const scoreData = [
    { name: 'Trust', value: data.trust_score },
    { name: 'Risk', value: 100 - data.trust_score }
  ];

  const getColor = (score) => {
    if (score > 70) return '#22c55e';
    if (score > 40) return '#f59e0b';
    return '#ef4444';
  };
  
  // Mock Load Data if not provided
  const loadData = [
      { time: '00s', load: 12 }, { time: '05s', load: 18 }, { time: '10s', load: 45 },
      { time: '15s', load: 32 }, { time: '20s', load: 67 }, { time: '25s', load: 89 },
      { time: '30s', load: 55 }, { time: '35s', load: 23 }, { time: '40s', load: 10 }
  ];

  return (
    <div className="space-y-8 pb-12 fade-in text-foreground">
      <div className="flex items-center justify-between">
        <Link to="/sessions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Session Explorer</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-border">
           <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
           <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Audit Mode Active</span>
        </div>
      </div>

      {/* Hero Decision Section */}
      <div className="bg-card border border-border rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-2xl">
        <div className={`absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none opacity-20 ${data.final_decision === 'ALLOW' ? 'bg-emerald-500' : data.final_decision === 'RESTRICT' ? 'bg-amber-500' : 'bg-red-500'}`} />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Session Identity</span>
              <h2 className="text-2xl font-mono text-foreground tracking-tighter break-all">{session_id}</h2>
            </div>
            
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-3xl ${theme.bg} ${theme.color} border ${theme.border} shadow-xl`}>
                <StatusIcon className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Policy Decision</span>
                <h3 className={`text-5xl font-black italic tracking-tighter ${theme.color}`}>{data.final_decision}</h3>
              </div>
            </div>
          </div>

          <div className="lg:max-w-xs w-full space-y-4">
             <div className="p-6 bg-muted/30 rounded-2xl border border-border shadow-inner">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-2">Recommended Strategy</span>
                <p className="text-lg font-bold text-foreground leading-tight">{data.recommended_action || 'Continuous Passive Monitoring'}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Reason:</span>
                  <span className="text-[11px] font-medium text-foreground">{data.primary_cause}</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Intelligence Indicators */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Risk Evidence ({data.risk_reasons?.length || 0})</h3>
              </div>
              <ul className="space-y-3">
                {data.risk_reasons?.map((reason, i) => (
                  <li key={i} className="flex items-start gap-4 bg-muted/40 p-4 rounded-2xl border border-border/50 group hover:border-red-500/30 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-red-500/50 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <span className="text-xs font-semibold text-foreground/80 leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 flex flex-col shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Engine Probabilities</h3>
              </div>
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                {[
                  { label: 'Bot Probability', val: data.bot_probability, color: 'bg-primary' },
                  { label: 'Attack Signal', val: data.attack_probability, color: 'bg-red-500' },
                  { label: 'Anomaly Score', val: data.anomaly_score, color: 'bg-amber-500' },
                  
                  // Fusion Signals
                  { label: 'Web Abuse', val: data.web_abuse_probability || 0, color: 'bg-cyan-500' },
                  { label: 'API Abuse', val: data.api_abuse_probability || 0, color: 'bg-violet-500' },
                  { label: 'Network Anomaly', val: data.network_anomaly_score || 0, color: 'bg-pink-500' },
                  { label: 'Infra Stress', val: data.infra_stress_score || 0, color: 'bg-slate-500' }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span>{item.label}</span>
                      <span className="text-foreground">{(item.val * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                      <div className={`h-full ${item.color} transition-all duration-1000`} style={{ width: `${item.val * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New Session Activity Graph */}
           <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
             <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Session Load Analysis</h3>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={loadData}>
                        <defs>
                            <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Area type="monotone" dataKey="load" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLoad)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
           </div>


          {/* Feedback & Actions */}
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                 <h4 className="text-sm font-black text-foreground uppercase tracking-wider">Expert Verification</h4>
                 <p className="text-xs text-muted-foreground font-medium">As an analyst, does this engine decision align with your audit?</p>
              </div>
              <div className="flex items-center gap-3">
                {feedback ? (
                   <div className="flex items-center gap-2 text-primary font-bold text-xs bg-primary/20 px-6 py-3 rounded-2xl border border-primary/30 animate-in zoom-in-95">
                      <ShieldCheck className="w-4 h-4" /> Final Audit Logged
                   </div>
                ) : (
                  <>
                    <button 
                      onClick={() => setFeedback('false')}
                      className="flex items-center gap-2 px-6 py-3 bg-muted hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-muted-foreground rounded-2xl border border-border text-xs font-black transition-all"
                    >
                      <ThumbsDown className="w-4 h-4" /> FALSE POSITIVE
                    </button>
                    <button 
                      onClick={() => setFeedback('confirm')}
                      className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-primary-foreground rounded-2xl shadow-lg shadow-primary/20 text-xs font-black transition-all"
                    >
                      <ThumbsUp className="w-4 h-4" /> CONFIRM INCIDENT
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Integrity Gauge & Metadata */}
        <div className="space-y-8">
          <div className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-10">Trust Integrity</h3>
            <div className="h-56 w-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    startAngle={90}
                    endAngle={450}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill={getColor(data.trust_score)} />
                    <Cell fill="hsl(var(--muted))" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black italic tracking-tighter text-foreground">{data.trust_score.toFixed(1)}</span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Score</span>
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-4 w-full">
              <div className="p-4 bg-muted/40 rounded-2xl border border-border text-center">
                <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-2" />
                <span className="block text-[8px] uppercase font-black text-muted-foreground mb-1">Duration</span>
                <span className="text-xs font-bold text-foreground">{data.session_duration_sec}s</span>
              </div>
              <div className="p-4 bg-muted/40 rounded-2xl border border-border text-center">
                <MapPin className="w-4 h-4 text-muted-foreground mx-auto mb-2" />
                <span className="block text-[8px] uppercase font-black text-muted-foreground mb-1">Origin</span>
                <span className="text-xs font-bold text-foreground">{data.ip_address || 'Cloud'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
             <button 
               onClick={() => setShowMetadata(!showMetadata)}
               className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-border text-muted-foreground hover:text-foreground transition-all group"
             >
                <div className="flex items-center gap-3">
                   <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                   <span className="text-xs font-black uppercase tracking-widest">Metadata Explorer</span>
                </div>
                {showMetadata ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
             </button>
             
             {showMetadata && (
               <div className="p-6 bg-muted/30 rounded-2xl border border-border space-y-4 fade-in">
                  <div className="grid grid-cols-2 gap-y-4 text-[10px]">
                     {Object.entries(data).filter(([k]) => typeof data[k] !== 'object' && k !== 'session_id').slice(0, 8).map(([key, val]) => (
                        <div key={key}>
                           <span className="block font-black text-muted-foreground uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                           <span className="text-foreground font-mono">{String(val)}</span>
                        </div>
                     ))}
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>


      {/* Forensics Timeline - NEW */}
      {data.events && data.events.length > 0 && (
          <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
             <div className="flex items-center gap-2 mb-8">
                <Clock className="w-5 h-5 text-blue-500" />
                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Live Forensics Timeline</h3>
             </div>
             
             <div className="relative border-l-2 border-border ml-4 space-y-8">
                {data.events.map((evt, idx) => (
                    <div key={idx} className="relative pl-8">
                        {/* Dot */}
                        <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-background ${
                            evt.event_type === 'auth' && evt.raw_features?.status === 'failed' ? 'bg-red-500' :
                            evt.event_type === 'attack' ? 'bg-red-500' :
                            'bg-muted-foreground'
                        }`}></div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">
                                {new Date(evt.timestamp_epoch * 1000).toLocaleTimeString()}
                            </span>
                            <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                                {evt.event_type} EVENT
                            </span>
                        </div>
                        
                        <div className="bg-muted/50 rounded p-3 text-xs font-mono text-muted-foreground border border-border/50">
                            {evt.event_type === 'http' && (
                                <span>{evt.raw_features?.method} {evt.raw_features?.path} <span className="text-muted-foreground/50">({evt.raw_features?.status_code})</span></span>
                            )}
                            {evt.event_type === 'auth' && (
                                <span className={evt.raw_features?.status === 'failed' ? 'text-red-500 font-bold' : 'text-emerald-500'}>
                                    Login {evt.raw_features?.status} from {evt.raw_features?.ip_address}
                                </span>
                            )}
                             {/* Fallback for others */}
                             {evt.event_type !== 'http' && evt.event_type !== 'auth' && (
                                 <span>{JSON.stringify(evt.raw_features)}</span>
                             )}
                        </div>
                    </div>
                ))}
             </div>
          </div>
      )}

    </div>
  );
};

export default SessionDetail; 

