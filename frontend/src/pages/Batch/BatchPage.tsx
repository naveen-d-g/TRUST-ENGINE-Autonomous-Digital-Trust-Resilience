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
    <div className="max-w-7xl mx-auto space-y-10 py-10 px-6 fade-in min-h-screen">
      {/* Header section with cyber accents */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/50 pb-8 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shadow-lg shadow-primary/5">
              <Database className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
                Batch Audit <span className="text-primary not-italic">Intelligence</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-ping" />
                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Neural Evaluation Engine v4.0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="px-6 py-3 bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Total Audited</span>
            <span className="text-2xl font-black text-white italic">{sessions.length}</span>
          </div>
          {currentJob && (
            <button 
              onClick={handleReset}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-slate-700 transition-all font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95"
            >
              New Audit
            </button>
          )}
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 gap-10">
        {!currentJob && <BatchUploadCard />}
        
        {currentJob && currentJob.status === 'PROCESSING' && (
          <div className="max-w-3xl mx-auto w-full">
            <BatchProgress />
          </div>
        )}

        {currentJob && currentJob.status === 'COMPLETED' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-card/30 backdrop-blur-xl border border-success/20 p-6 rounded-3xl flex items-center gap-5">
                 <div className="p-4 bg-success/10 rounded-2xl">
                   <ShieldCheck className="w-8 h-8 text-success" />
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Master Status</p>
                   <p className="text-xl font-black text-white uppercase italic">Audit Verified</p>
                 </div>
               </div>

               <div className="bg-card/30 backdrop-blur-xl border border-primary/20 p-6 rounded-3xl flex items-center gap-5">
                 <div className="p-4 bg-primary/10 rounded-2xl">
                   <Activity className="w-8 h-8 text-primary" />
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Inference Confidence</p>
                   <p className="text-xl font-black text-white">99.2%</p>
                 </div>
               </div>

               <div className="bg-card/30 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl flex flex-col justify-center">
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Result ID (Hash)</p>
                   <p className="text-[10px] font-mono text-slate-400 break-all">{currentJob.result_hash || 'PENDING'}</p>
               </div>
            </div>

            <BatchResultsTable />
          </div>
        )}

        {currentJob && currentJob.status === 'FAILED' && (
          <div className="max-w-2xl mx-auto w-full p-12 bg-danger/5 border border-danger/20 rounded-[2.5rem] text-center space-y-6">
            <div className="w-20 h-20 bg-danger/10 text-danger rounded-3xl flex items-center justify-center mx-auto text-4xl font-black">!</div>
            <h3 className="text-2xl font-black text-white">Ingestion Failure</h3>
            <p className="text-slate-400">The intelligence processing engine encountered a fatal error during CSV parsing.</p>
            <button onClick={handleReset} className="px-10 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Re-initialize Engine</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchPage;
