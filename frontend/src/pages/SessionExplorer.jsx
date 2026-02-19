import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRight, ExternalLink, Shield, RefreshCw, AlertTriangle, SortAsc, SortDesc } from 'lucide-react';
import { metricsService } from '../services/api';
import DemoService from '../services/demo.service';

const SessionExplorer = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [sortMode, setSortMode] = useState('time_desc'); // time_desc, time_asc, trust_asc, trust_desc
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;
  const navigate = useNavigate();

  const fetchSessions = useCallback(async (newFilter = 'ALL', newOffset = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      
      let res;
      if (newFilter === 'DEMO') {
          const demoData = await DemoService.getAllDemoSessions(LIMIT, newOffset);
          res = demoData.map(d => ({
              session_id: d.demo_session_id,
              trust_score: d.final_trust_score,
              risk_score: 100 - d.final_trust_score, // Proxy
              final_decision: d.final_decision,
              primary_cause: 'Demo Simulation', 
              start_time: d.start_time,
              is_demo: true,
              risk_velocity: Math.random() * 2 // Mock velocity for demo
          }));
      } else {
          // Fetch production data
          // Note: Backend currently supports filtering by decision only in basics.
          // We fetch 'ALL' from backend and filter/sort clientside for advanced props if backend isn't ready
          // Or we utilize the 'decision' param if filter matches a decision.
          const decisionFilter = ['ALLOW', 'RESTRICT', 'ESCALATE'].includes(newFilter) ? newFilter : undefined;
          const sourceFilter = newFilter === 'BATCH' ? 'batch' : undefined;
          
          const apiRes = await metricsService.getSessions(LIMIT, newOffset, decisionFilter, sourceFilter);
          
          let demoRes = [];
          if ((newFilter === 'ALL' || newFilter === 'DEMO') && newOffset === 0 && !sourceFilter) { 
              try {
                const dData = await DemoService.getAllDemoSessions(LIMIT, 0); 
                demoRes = dData.map(d => ({
                    session_id: d.demo_session_id,
                    trust_score: d.final_trust_score,
                    risk_score: 100 - d.final_trust_score,
                    final_decision: d.final_decision,
                    primary_cause: 'Demo Simulation', 
                    start_time: d.start_time,
                    is_demo: true,
                    risk_velocity: Math.random() * 2
                }));
              } catch (e) { console.warn("Demo fetch failed", e); }
          }

          const prodData = apiRes.map(s => ({
              ...s,
              start_time: s.created_at,
              is_demo: false,
              risk_velocity: s.metrics?.risk_velocity || 0 // Assuming we might patch backend to include metrics
          }));
          
          res = [...demoRes, ...prodData];
          
          // Client-side Sorting
          res = sortSessions(res, sortMode);
      }
      
      if (append) {
        setSessions(prev => sortSessions([...prev, ...res], sortMode));
      } else {
        setSessions(res);
      }
      
      setHasMore(res.length >= LIMIT);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [sortMode, sortSessions]);

  const sortSessions = useCallback((data, mode) => {
      const s = [...data];
      switch(mode) {
          case 'time_desc': return s.sort((a,b) => new Date(b.start_time) - new Date(a.start_time));
          case 'time_asc': return s.sort((a,b) => new Date(a.start_time) - new Date(b.start_time));
          case 'trust_asc': return s.sort((a,b) => a.trust_score - b.trust_score);
          case 'trust_desc': return s.sort((a,b) => b.trust_score - a.trust_score);
          case 'risk_desc': return s.sort((a,b) => (b.risk_score || 0) - (a.risk_score || 0));
          default: return s;
      }
  }, []);

  useEffect(() => {
    fetchSessions(filter, 0, false);
    setOffset(0);
  }, [filter, fetchSessions]);

  useEffect(() => {
     // Re-sort when sort mode changes
     setSessions(prev => sortSessions(prev, sortMode));
  }, [sortMode, sortSessions]);

  const handleLoadMore = () => {
    const nextOffset = offset + LIMIT;
    setOffset(nextOffset);
    fetchSessions(filter, nextOffset, true);
  };

  const filteredSessions = sessions.filter(s => 
    s.session_id.toLowerCase().includes(search.toLowerCase())
  );

  const getDecisionColor = (decision) => {
    if (!decision) return 'bg-muted text-muted-foreground border-muted';
    const d = decision.toUpperCase();
    switch (d) {
      case 'ALLOW': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'RESTRICT': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'ESCALATE': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Session Explorer
          </h2>
          <p className="text-muted-foreground text-sm">Audit and investigate predictive risk signals.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search session ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-all"
            />
          </div>
          
          <select 
             className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
             value={sortMode}
             onChange={(e) => setSortMode(e.target.value)}
          >
              <option value="time_desc">Newest First</option>
              <option value="time_asc">Oldest First</option>
              <option value="trust_asc">Lowest Trust</option>
              <option value="risk_desc">Highest Risk</option>
          </select>
        </div>
      </div>

       <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['ALL', 'ALLOW', 'RESTRICT', 'ESCALATE', 'DEMO', 'BATCH'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all border ${filter === f ? 'bg-primary/20 border-primary text-primary shadow-sm' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}
              >
                {f}
              </button>
            ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Session Identity</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Time</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Risk Score</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Policy Decision</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">Primary Cause</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && !sessions.length ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6"><div className="h-4 bg-muted rounded w-48"></div></td>
                  <td className="px-6 py-6"><div className="h-6 bg-muted rounded-full w-12 mx-auto"></div></td>
                  <td className="px-6 py-6"><div className="h-4 bg-muted rounded w-24"></div></td>
                  <td className="px-6 py-6 hidden lg:table-cell"><div className="h-4 bg-muted rounded w-40"></div></td>
                  <td className="px-6 py-6"></td>
                </tr>
              ))
            ) : filteredSessions.length > 0 ? (
              filteredSessions.map((row) => (
                <tr 
                  key={row.session_id} 
                  className="hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(row.is_demo ? `/demo/${row.session_id}` : `/sessions/${row.session_id}`)}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border shadow-sm group-hover:border-primary/50 transition-colors">
                        <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-foreground font-medium tracking-tight">
                            {row.session_id.substring(0, 18)}...
                        </span>
                         {row.is_demo && (
                              <span className="inline-block mt-1 w-fit px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[9px] border border-purple-500/20">
                                  DEMO SIMULATION
                              </span>
                          )}
                          {!row.is_demo && row.risk_velocity > 0.5 && (
                              <span className="inline-block mt-1 w-fit px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 text-[9px] border border-orange-500/20 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  VELOCITY SURGE
                              </span>
                          )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                      <div className="flex flex-col">
                          <span className="text-xs text-foreground font-medium">
                              {row.start_time ? new Date(row.start_time).toLocaleDateString() : 'N/A'}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                              {row.start_time ? new Date(row.start_time).toLocaleTimeString() : ''}
                          </span>
                      </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center">
                        <span className={`text-sm font-bold ${row.trust_score < 40 ? 'text-red-500' : 'text-foreground'}`}>
                        {row.trust_score?.toFixed(0)}%
                        </span>
                        <div className="w-16 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                            <div 
                                className={`h-full ${row.trust_score > 70 ? 'bg-emerald-500' : row.trust_score > 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                style={{ width: `${row.trust_score}%` }}
                            />
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getDecisionColor(row.final_decision)}`}>
                      {row.final_decision}
                    </span>
                  </td>
                  <td className="px-6 py-5 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground font-medium">{row.primary_cause || "—"}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 bg-background rounded-lg text-muted-foreground hover:text-primary-foreground hover:bg-primary transition-all shadow-sm border border-border">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Search className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground font-medium">No sessions found matching filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {hasMore && sessions.length > 0 && (
          <div className="p-4 bg-muted/20 border-t border-border flex justify-center">
            <button 
              onClick={handleLoadMore}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-card hover:bg-muted text-foreground font-bold text-[10px] uppercase tracking-widest rounded-lg border border-border transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Load More Intel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionExplorer;
