import React from 'react';
import { useBatchStore } from '../../../store/batchStore';
import { Activity, ShieldCheck, Cpu, Database } from 'lucide-react';

export const BatchProgress: React.FC = () => {
  const { progress } = useBatchStore();

  const steps = [
    { name: 'Schema Validation', active: progress > 0, done: progress > 10 },
    { name: 'Feature Extraction', active: progress > 10, done: progress > 40 },
    { name: 'Inference Cycle', active: progress > 40, done: progress > 80 },
    { name: 'Policy Resolution', active: progress > 80, done: progress >= 100 },
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-[3rem] p-10 border border-slate-800 shadow-2xl space-y-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
      
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-slate-800 rounded-full flex items-center justify-center">
            <span className="text-4xl font-black text-white italic">{Math.round(progress)}%</span>
          </div>
          <svg className="absolute top-0 left-0 w-32 h-32 -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={377}
              strokeDashoffset={377 - (377 * progress) / 100}
              className="text-primary transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
            <Cpu className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Intelligence Synchronization</h3>
          <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">Running Neural Inference Pipeline...</p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div 
            key={idx} 
            className={`flex items-center gap-4 transition-all duration-500 ${step.active ? 'opacity-100' : 'opacity-20'}`}
          >
            <div className={`p-2 rounded-lg ${step.done ? 'bg-success/20 text-success' : step.active ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-600'}`}>
              {step.done ? <ShieldCheck size={16} /> : <Activity size={16} />}
            </div>
            <div className="flex-1">
               <div className="flex justify-between items-center mb-1">
                 <span className={`text-[10px] font-black uppercase tracking-widest ${step.active ? 'text-white' : 'text-slate-600'}`}>{step.name}</span>
                 {step.done && <span className="text-[10px] text-success font-black uppercase tracking-tighter italic">Ready</span>}
               </div>
               <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                 <div 
                  className={`h-full transition-all duration-700 ${step.done ? 'bg-success w-full' : step.active ? 'bg-primary animate-shimmer' : 'w-0'}`} 
                  style={{ backgroundSize: '200% 100%' }}
                 />
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 flex justify-center border-t border-slate-800/50">
          <div className="flex items-center gap-3 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] italic">
            <Database className="w-4 h-4" />
            Active Session Stream: Synchronizing to Postgres Cluster
          </div>
      </div>
    </div>
  );
};
