
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRight, ExternalLink, Shield, RefreshCw } from 'lucide-react';
import { metricsService } from '../services/api';
import DemoService from '../services/demo.service';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;
  const navigate = useNavigate();

  const fetchSessions = async (newFilter = 'ALL', newOffset = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      
      let res;
      if (newFilter === 'DEMO') {
          const demoData = await DemoService.getAllDemoSessions(LIMIT, newOffset);
          // Map to match session structure
          res = demoData.map(d => ({
              session_id: d.demo_session_id,
              trust_score: d.final_trust_score,
              final_decision: d.final_decision,
              primary_cause: 'Demo Simulation', 
              start_time: d.start_time,
              is_demo: true
          }));
      } else {
          const apiRes = await metricsService.getSessions(LIMIT, newOffset, newFilter);
          
          let demoRes = [];
          // Only fetch demo data if filter is ALL or DEMO (but DEMO is handled above)
          // Actually, just fetch standard demo data if filter is ALL to mix in
          if (newFilter === 'ALL' && newOffset === 0) { 
              // Fetch recent demo sessions to mix into the top of the feed
              const dData = await DemoService.getAllDemoSessions(5, 0); 
              demoRes = dData.map(d => ({
                  session_id: d.demo_session_id,
                  trust_score: d.final_trust_score,
                  final_decision: d.final_decision,
                  primary_cause: 'Demo Simulation', 
                  start_time: d.start_time,
                  is_demo: true
              }));
          }

          // Normal sessions use 'created_at' in DB, map to start_time for consistent UI
          const prodData = apiRes.map(s => ({
              ...s,
              start_time: s.created_at, // Map existing created_at to start_time
              is_demo: false
          }));
          
          // Merge and Sort
          res = [...demoRes, ...prodData].sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
      }
      
      if (append) {
        setSessions(prev => [...prev, ...res]);
      } else {
        setSessions(res);
      }
      
      setHasMore(res.length === LIMIT);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(filter, 0, false);
    setOffset(0);
  }, [filter]);

  const handleLoadMore = () => {
    const nextOffset = offset + LIMIT;
    setOffset(nextOffset);
    fetchSessions(filter, nextOffset, true);
  };

  const filteredSessions = sessions.filter(s => 
    s.session_id.toLowerCase().includes(search.toLowerCase())
  );

  const getDecisionColor = (decision) => {
    if (!decision) return 'bg-slate-700 text-slate-300 border-slate-600';
    const d = decision.toUpperCase();
    switch (d) {
      case 'ALLOW': return 'bg-success/20 text-success border-success/30';
      case 'RESTRICT': return 'bg-danger/20 text-danger border-danger/30';
      case 'ESCALATE': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Session Explorer</h2>
          <p className="text-slate-400 text-sm">Audit and investigate individual session decisions.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search session ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-800 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700/50 rounded-lg p-1">
            {['ALL', 'ALLOW', 'RESTRICT', 'ESCALATE', 'DEMO'].map(f => (
              <button
                key={f}
                onClick={() => {
                   setFilter(f);
                   // reset offset when changing filter is handled by useEffect deps
                }}
                className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all ${filter === f ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-slate-700/30 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/40 border-b border-slate-700/50">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Session Identity</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Trust Score</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Policy Decision</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Primary Cause</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6"><div className="h-4 bg-slate-700 rounded w-48"></div></td>
                  <td className="px-6 py-6"><div className="h-6 bg-slate-700 rounded-full w-12 mx-auto"></div></td>
                  <td className="px-6 py-6"><div className="h-4 bg-slate-700 rounded w-24"></div></td>
                  <td className="px-6 py-6 hidden lg:table-cell"><div className="h-4 bg-slate-700 rounded w-40"></div></td>
                  <td className="px-6 py-6"></td>
                </tr>
              ))
            ) : filteredSessions.length > 0 ? (
              filteredSessions.map((row) => (
                <tr 
                  key={row.session_id} 
                  className="hover:bg-slate-700/20 transition-colors cursor-pointer group"
                  onClick={() => navigate(row.is_demo ? `/demo/${row.session_id}` : `/sessions/${row.session_id}`)}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner group-hover:border-primary/50 transition-colors">
                        <Shield className="w-4 h-4 text-slate-500 group-hover:text-primary" />
                      </div>
                      <span className="font-mono text-xs text-slate-300 font-medium tracking-tight">
                          {row.session_id}
                          {row.is_demo && (
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300 text-[10px] border border-purple-500/30">
                                  DEMO
                              </span>
                          )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                      <div className="flex flex-col">
                          <span className="text-xs text-white font-medium">
                              {row.start_time ? new Date(row.start_time).toLocaleDateString() : 'N/A'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                              {row.start_time ? new Date(row.start_time).toLocaleTimeString() : ''}
                          </span>
                      </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-sm font-bold ${row.trust_score > 70 ? 'text-success' : row.trust_score > 40 ? 'text-warning' : 'text-danger'}`}>
                      {row.trust_score.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getDecisionColor(row.final_decision)}`}>
                      {row.final_decision}
                    </span>
                  </td>
                  <td className="px-6 py-5 hidden lg:table-cell">
                    <span className="text-sm text-slate-400 font-medium">{row.primary_cause}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 bg-slate-800 rounded-lg text-slate-500 hover:text-white hover:bg-primary transition-all shadow-sm">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Search className="w-8 h-8 text-slate-600 mb-2" />
                    <p className="text-slate-500 font-medium">No intelligence reports found matching criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {hasMore && sessions.length > 0 && (
          <div className="p-4 bg-slate-800/20 border-t border-slate-700/30 flex justify-center">
            <button 
              onClick={handleLoadMore}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-lg border border-slate-700 transition-all disabled:opacity-50"
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

export default Sessions;
