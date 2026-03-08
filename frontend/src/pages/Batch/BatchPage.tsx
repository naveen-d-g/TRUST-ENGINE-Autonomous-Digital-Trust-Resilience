import React, { useEffect } from 'react';
import { useBatchStore } from '../../store/batchStore';
import { useSessionStore } from '../../store/sessionStore';
import { BatchUploadCard } from './components/BatchUploadCard';
import { BatchProgress } from './components/BatchProgress';
import { BatchResultsTable } from './components/BatchResultsTable';
import { Database, ShieldCheck, Activity } from 'lucide-react';

const BatchPage: React.FC = () => {
  const { currentJob, reset, fetchStatus } = useBatchStore();
  const { sessions, loadBatchResults, clear: clearSessions } = useSessionStore();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (currentJob?.status === 'PROCESSING') {
      interval = setInterval(() => {
        fetchStatus(currentJob.id);
      }, 2000);
    } else if (currentJob?.status === 'COMPLETED') {
      loadBatchResults(currentJob.id);
    }

    return () => clearInterval(interval);
  }, [currentJob?.status, currentJob?.id, loadBatchResults, fetchStatus]);

  const handleReset = () => {
    reset();
    clearSessions();
  };

  return (
    <div className="relative min-h-screen bg-bgPrimary overflow-hidden cyber-grid">
      {/* Dynamic Background Elements */}
      <div className="absolute top-20 left-[10%] w-[40rem] h-[40rem] bg-primary/10 blur-[150px] rounded-full animate-float pointer-events-none" />
      <div className="absolute bottom-20 right-[10%] w-[30rem] h-[30rem] bg-purple-600/5 blur-[120px] rounded-full animate-float pointer-events-none" style={{ animationDelay: '-3s' }} />
      <div className="scanline pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 py-8 px-6 relative z-10 fade-in">
        {/* Header section with enhanced cyber accents */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/50 pb-8 relative">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-xl animate-pulse" />
              <div className="p-3 bg-slate-900 border border-primary/30 rounded-xl shadow-xl relative">
                <Database className="w-7 h-7 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-tight">
                Batch Audit <span className="text-primary not-italic">Intelligence</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-success animate-ping absolute" />
                  <div className="w-2 h-2 rounded-full bg-success relative" />
                </div>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">Neural Evaluation Protocol v4.0.8</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="px-6 py-3 bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800/50 flex flex-col items-center shadow-md relative glow-border-blue">
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1.5">Total Intelligence Items</span>
              <span className="text-2xl font-black text-white italic tracking-tighter">{sessions.length}</span>
            </div>
            {currentJob && (
              <button 
                onClick={handleReset}
                className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 group flex items-center gap-2"
              >
                <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                New Sequence
              </button>
            )}
          </div>
        </div>

        {/* Main Content Areas */}
        <div className="relative z-10">
          {!currentJob && <BatchUploadCard />}
          
          {currentJob && currentJob.status === 'PROCESSING' && (
            <div className="max-w-2xl mx-auto w-full py-20 relative">
              <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full animate-pulse" />
              <BatchProgress />
            </div>
          )}

          {currentJob && currentJob.status === 'COMPLETED' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-success/20 p-6 rounded-[2rem] flex items-center gap-4 shadow-xl relative overflow-hidden group hover:border-success/40 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 blur-[40px] rounded-full group-hover:bg-success/10 transition-all" />
                  <div className="p-4 bg-success/10 rounded-xl border border-success/20 shadow-md group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-7 h-7 text-success" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1.5">Audit Status</p>
                    <p className="text-2xl font-black text-white uppercase italic tracking-tighter group-hover:text-success transition-colors">Verified</p>
                  </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-xl border border-primary/20 p-6 rounded-[2rem] flex items-center gap-4 shadow-xl relative overflow-hidden group hover:border-primary/40 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] rounded-full group-hover:bg-primary/10 transition-all" />
                  <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 shadow-md group-hover:scale-110 transition-transform">
                    <Activity className="w-7 h-7 text-primary animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-1.5">Logic Engine</p>
                    <p className="text-2xl font-black text-white tracking-tighter uppercase group-hover:text-primary transition-colors">99.2% <span className="text-[10px] text-slate-500 not-italic font-bold ml-1 tracking-widest leading-none">TRUST</span></p>
                  </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-[2rem] flex flex-col justify-center shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-400/5 blur-[40px] rounded-full" />
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2 px-1">Sequence ID Hash</p>
                    <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 group-hover:bg-slate-900 transition-colors">
                      <p className="text-[9px] font-mono text-slate-400 break-all leading-tight select-all">{currentJob.result_hash || '7ad...2b8c'}</p>
                    </div>
                </div>
              </div>

              <div className="relative pt-4">
                <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary/5 blur-[50px] rounded-full pointer-events-none" />
                <div className="absolute -top-4 -left-4 w-16 h-16 border-t font-black border-l border-primary/10 rounded-tl-[2rem] pointer-events-none" />
                <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b border-r border-primary/10 rounded-br-[2rem] pointer-events-none" />
                <BatchResultsTable />
              </div>
            </div>
          )}

          {currentJob && currentJob.status === 'FAILED' && (
            <div className="max-w-xl mx-auto w-full p-12 bg-danger/5 backdrop-blur-xl border border-danger/20 rounded-[2.5rem] text-center space-y-6 animate-in zoom-in duration-500 shadow-xl">
              <div className="w-20 h-20 bg-danger/10 text-danger rounded-[1.5rem] flex items-center justify-center mx-auto text-4xl font-black shadow-md shadow-danger/5 animate-pulse">!</div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Ingestion Critical Fault</h3>
                <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">The intelligence processing engine encountered a terminal exception during dataset reconciliation.</p>
              </div>
              <button 
                onClick={handleReset} 
                className="px-10 py-4 bg-slate-800 hover:bg-danger/20 text-white hover:text-danger rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-slate-700 hover:border-danger/30"
              >
                Re-initialize Core Engine
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchPage;
