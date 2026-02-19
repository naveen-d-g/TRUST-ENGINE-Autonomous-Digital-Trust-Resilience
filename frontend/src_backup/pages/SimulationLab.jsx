
import React, { useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Play, 
  Square, 
  UserX, 
  Bot, 
  RefreshCw, 
  List
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { simulationService as SimulationService } from '../services/api';

const SimulationLab = () => {
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSimId, setActiveSimId] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Poll for updates if active
  // Actually, for a "Live" feel we can just rely on the response from recordEvent 
  // to update the state, but polling ensures we see everything if backend logic is complex.
  // Given our service implementation returns the full analysis on recordEvent, 
  // we can update local state immediately.

  const startSimulation = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await SimulationService.startSimulation();
      setSession(data);
      setActiveSimId(data.simulation_id);
      setEvents([]);
    } catch (err) {
      setError('Failed to start simulation');
    } finally {
      setLoading(false);
    }
  };

  const endSimulation = async () => {
    if (!activeSimId) return;
    setLoading(true);
    try {
      const data = await SimulationService.endSimulation(activeSimId);
      setSession(data); // Final state
      setActiveSimId(null);
    } catch (err) {
      setError('Failed to end simulation');
    } finally {
      setLoading(false);
    }
  };

  const triggerEvent = async (eventType, metadata = {}) => {
    if (!activeSimId || processing) return;
    setProcessing(true);
    // Don't set global loading as we want snappy UI, maybe local button loading
    try {
      const result = await SimulationService.recordEvent(activeSimId, eventType, metadata);
      // Result has { event, analysis }
      
      const newEvent = result.event;
      const analysis = result.analysis;
      
      setEvents(prev => [...prev, newEvent]);
      
      // Update session metrics live
      setSession(prev => ({
        ...prev,
        final_trust_score: analysis.trust_score,
        final_decision: analysis.final_decision,
        primary_cause: analysis.primary_cause,
        recommended_action: analysis.recommended_action
      }));
      
    } catch (err) {
      setError('Failed to record event');
    } finally {
      setProcessing(false);
    }
  };

  // Helper to get color for score
  const getScoreColor = (score) => {
    if (score >= 60) return 'text-green-500';
    if (score >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getDecisionBadge = (decision) => {
    switch(decision) {
        case 'ALLOW': return <span className="px-3 py-1 rounded bg-green-900 text-green-300 font-bold">ALLOW</span>;
        case 'RESTRICT': return <span className="px-3 py-1 rounded bg-yellow-900 text-yellow-300 font-bold">RESTRICT</span>;
        case 'ESCALATE': return <span className="px-3 py-1 rounded bg-red-900 text-red-300 font-bold">ESCALATE</span>;
        default: return <span className="px-3 py-1 rounded bg-gray-700 text-gray-300">{decision}</span>;
    }
  };

  // Chart Data Preparation
  const chartData = events.map((e, index) => ({
    name: index + 1,
    score: e.current_trust_score,
    type: e.event_type,
    decision: e.current_decision
  }));

  // Add initial point if empty?
  if (chartData.length === 0 && session) {
      chartData.push({ name: 0, score: 100, type: 'START' });
  }

  return (
    <div className="p-6 bg-background min-h-screen text-foreground font-sans transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" />
            Attack Simulation Lab
          </h1>
          <p className="text-muted-foreground mt-1">Isolate Red-Team Scenarios & Trust Validation</p>
        </div>
        
        {activeSimId ? (
            <button 
                onClick={endSimulation} 
                disabled={loading || processing}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-semibold transition-all"
            >
                <Square className="w-4 h-4 fill-current" /> End Session
            </button>
        ) : (
            <button 
                onClick={startSimulation} 
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-blue-900/50"
            >
                <Play className="w-4 h-4 fill-current" /> Start New Simulation
            </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> {error}
        </div>
      )}

      {!session ? (
        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/30">
            <Shield className="w-16 h-16 text-muted mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">No Active Simulation</h3>
            <p className="text-muted-foreground mb-6">Start a session to simulate user traffic and attacks.</p>
            <button 
                onClick={startSimulation} 
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-blue-900/50"
            >
                <Play className="w-4 h-4 fill-current" /> Initialize Simulation
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Controls */}
            <div className="lg:col-span-3 space-y-4">
                <div className="bg-card p-5 rounded-xl border border-border">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <UserX className="w-5 h-5 text-purple-400" /> Attack Tools
                    </h3>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => triggerEvent('FAILED_LOGIN')}
                            disabled={processing}
                            className={`p-3 rounded text-left border-l-4 border-warning transition-all ${processing ? 'opacity-50 cursor-not-allowed bg-muted/50' : 'bg-muted/50 hover:bg-muted'}`}
                        >
                            <span className="font-bold block text-sm">Targeted Login Fail</span>
                            <span className="text-xs text-muted-foreground">Simulate brute-force attempt</span>
                        </button>
                        
                        <button 
                             onClick={() => triggerEvent('CAPTCHA_FAIL')}
                             disabled={processing}
                             className={`p-3 rounded text-left border-l-4 border-orange-500 transition-all ${processing ? 'opacity-50 cursor-not-allowed bg-muted/50' : 'bg-muted/50 hover:bg-muted'}`}
                        >
                            <span className="font-bold block text-sm">Fail CAPTCHA</span>
                            <span className="text-xs text-muted-foreground">User fails challenge</span>
                        </button>
                        
                        <button 
                             onClick={() => triggerEvent('BOT_NAVIGATION')}
                             disabled={processing}
                             className={`p-3 rounded text-left border-l-4 border-red-500 transition-all ${processing ? 'opacity-50 cursor-not-allowed bg-gray-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            <span className="font-bold block text-sm">Bot Navigation Pattern</span>
                            <span className="text-xs text-gray-400">Headless browser / Automation</span>
                        </button>

                         <button 
                             onClick={() => triggerEvent('PAGE_VISIT', {})}
                             disabled={processing}
                             className={`p-3 rounded text-left border-l-4 border-green-500 transition-all ${processing ? 'opacity-50 cursor-not-allowed bg-gray-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            <span className="font-bold block text-sm">Normal Page Visit</span>
                            <span className="text-xs text-gray-400">Simulate benign traffic</span>
                        </button>
                    </div>
                </div>

                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-400" /> Identity Actions
                    </h3>
                    <button 
                            onClick={() => triggerEvent('PASSWORD_RESET')}
                            disabled={processing}
                        className={`w-full p-3 bg-blue-900/30 rounded text-blue-200 border border-blue-800 transition-all mb-2 ${processing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-900/50'}`}
                    >
                        Reset Password Flow
                    </button>
                </div>
            </div>

            {/* Middle: Live Monitor */}
            <div className="lg:col-span-6 bg-card p-6 rounded-xl border border-border flex flex-col">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Live Trust Monitor</h2>
                        <div className="text-sm text-muted-foreground font-mono mt-1">Session ID: {session.simulation_id}</div>
                    </div>
                    <div className="flex flex-col items-end">
                         <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Current Decision</div>
                         {getDecisionBadge(session.final_decision)}
                    </div>
                </div>

                {/* Score Big Display */}
                <div className="text-center mb-8">
                     <span className="text-sm text-muted-foreground uppercase">Trust Score</span>
                     <div className={`text-6xl font-black ${getScoreColor(session.final_trust_score ?? 100)} transition-all duration-500`}>
                        {session.final_trust_score !== undefined && session.final_trust_score !== null ? session.final_trust_score.toFixed(1) : 100.0}
                     </div>
                </div>

                {/* Chart */}
                <div className="flex-1 min-h-[300px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                stroke="hsl(var(--muted-foreground))" 
                                tick={{ fontSize: 10 }}
                                label={{ value: 'Event index', position: 'insideBottom', offset: -5, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis 
                                domain={[0, 100]} 
                                stroke="hsl(var(--muted-foreground))"
                                label={{ value: 'Trust Score', angle: -90, position: 'insideLeft', fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <Tooltip 
                                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-card border border-border p-3 rounded-lg shadow-xl">
                                                <div className="text-xs text-muted-foreground mb-1">Event #{data.name}</div>
                                                <div className="font-bold text-primary">{data.type}</div>
                                                <div className="flex justify-between gap-4 mt-2 font-mono text-sm">
                                                    <span>Score: <span className={getScoreColor(data.score)}>{data.score.toFixed(1)}</span></span>
                                                    <span className="text-muted-foreground">{data.decision}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <ReferenceLine y={60} label={{ position: 'right', value: 'RESTRICT', fill: '#EAB308', fontSize: 10 }} stroke="#EAB308" strokeDasharray="3 3" />
                            <ReferenceLine y={30} label={{ position: 'right', value: 'ESCALATE', fill: '#EF4444', fontSize: 10 }} stroke="#EF4444" strokeDasharray="3 3" />
                            <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={4}
                                dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                                animationDuration={500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Analysis Report */}
                {session.primary_cause && (
                    <div className="bg-muted/30 rounded-lg p-4 border border-border grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Primary Risk Cause</span>
                            <span className="font-bold text-destructive flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4" /> {session.primary_cause}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Recommendation</span>
                            <span className="font-bold text-primary flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> {session.recommended_action}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Event Timeline */}
            <div className="lg:col-span-3 bg-card p-5 rounded-xl border border-border h-[600px] overflow-hidden flex flex-col">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border pb-2">
                    <List className="w-5 h-5 text-muted-foreground" /> Event Stream
                </h3>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {events.slice().reverse().map((e, i) => {
                        const reverseIndex = events.length - 1 - i;
                        const prevScore = reverseIndex > 0 ? events[reverseIndex - 1].current_trust_score : 100;
                        const scoreDiff = e.current_trust_score - prevScore;
                        
                        return (
                            <div key={e.event_id || i} className="p-3 rounded bg-muted/30 border border-border text-sm group hover:border-primary/50 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-bold ${e.event_type.includes('FAIL') || e.event_type.includes('BOT') ? 'text-destructive' : 'text-primary'}`}>
                                        {e.event_type}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Score</span>
                                        <div className="flex items-center gap-1">
                                            <span className={`font-bold ${getScoreColor(e.current_trust_score)}`}>{e.current_trust_score.toFixed(1)}</span>
                                            {scoreDiff !== 0 && (
                                                <span className={`text-[10px] ${scoreDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    ({scoreDiff > 0 ? '+' : ''}{scoreDiff.toFixed(1)})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col">
                                        <span className="text-muted-foreground text-[10px] uppercase">Action</span>
                                        <span className="font-semibold text-foreground uppercase text-[10px] tracking-tight">{e.current_decision}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {events.length === 0 && (
                        <div className="text-center text-gray-500 py-10 italic">
                            Waiting for events...
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SimulationLab;
