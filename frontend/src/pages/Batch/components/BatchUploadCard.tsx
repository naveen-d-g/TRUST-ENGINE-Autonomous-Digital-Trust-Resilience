import React, { useState, useRef } from 'react';
import { Upload, Database, ShieldAlert, CheckCircle2, Zap } from 'lucide-react';
import { useBatchStore } from '../../../store/batchStore';

export const BatchUploadCard: React.FC = () => {
  const { upload, loading, error } = useBatchStore();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await upload(selectedFile);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in zoom-in-95 duration-1000">
      <div 
        className={`relative group rounded-[3rem] p-8 transition-all duration-700 border-2 border-dashed flex flex-col items-center justify-center space-y-6 overflow-hidden glass-card ${
          dragActive 
          ? 'bg-primary/10 border-primary shadow-[0_0_60px_rgba(59,130,246,0.3)] ring-4 ring-primary/5' 
          : 'bg-slate-900/40 border-slate-800 hover:border-primary/30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleChange}
        />

        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-700 shadow-xl relative ${
          selectedFile ? 'bg-success text-white scale-110' : 'bg-slate-800/80 text-slate-500 group-hover:text-primary group-hover:scale-110 group-hover:bg-slate-900 group-hover:shadow-primary/20'
        }`}>
          {selectedFile ? (
            <div className="relative">
              <CheckCircle2 size={36} />
              <div className="absolute inset-0 bg-white/20 blur-md rounded-full animate-pulse" />
            </div>
          ) : (
            <Upload size={36} className="group-hover:animate-bounce" />
          )}
        </div>

        <div className="text-center space-y-2 relative z-10">
          <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase">
            {selectedFile ? selectedFile.name : 'Dataset Ingestion Master'}
          </h3>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[8px]">
            {selectedFile 
              ? `${(selectedFile.size / 1024).toFixed(1)} KB — SYNC READY` 
              : 'Protocol: Drag & Drop or Click to Initialize'}
          </p>
        </div>

        <div className="flex gap-4 relative z-10">
          {!selectedFile ? (
            <button 
              onClick={onButtonClick}
              className="px-10 py-4 bg-slate-900/80 hover:bg-slate-800 text-white rounded-xl border border-slate-800 transition-all font-black text-[9px] uppercase tracking-[0.2em] hover:border-primary/50 shadow-lg"
            >
              Access Local Storage
            </button>
          ) : (
            <button 
              onClick={() => setSelectedFile(null)}
              className="px-8 py-4 bg-danger/5 hover:bg-danger/10 text-danger rounded-xl border border-danger/20 transition-all font-black text-[9px] uppercase tracking-[0.2em] hover:border-danger/40"
            >
              Abort Sequence
            </button>
          )}
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-8 glow-border-blue relative overflow-hidden group/req shadow-xl transition-all hover:bg-slate-900/50">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors" />
        
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-inner group-hover:scale-105 transition-transform duration-700">
            <Database className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div>
              <h4 className="text-lg font-black text-white italic uppercase tracking-tight mb-1.5">High-Fidelity Schema Protocol</h4>
              <p className="text-slate-500 text-xs font-medium">Neural evaluation requires adherence to the behavioral event contract.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['session_id', 'user_id', 'event_type', 'ip', 'timestamp', 'payload'].map(col => (
                <div key={col} className="bg-white/[0.03] px-4 py-2 rounded-xl text-[9px] font-mono text-primary/80 border border-white/5 flex items-center justify-between group/item hover:bg-primary/5 hover:border-primary/20 transition-all">
                  <span className="font-bold tracking-tight">{col}</span>
                  <div className="w-1 h-1 rounded-full bg-primary/30 group-hover/item:bg-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center p-1.5">
               <div className="w-full h-full rounded-full bg-info/20 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-600 font-black uppercase tracking-[0.2em] leading-none mb-1">Inference Priority</span>
              <span className="text-[10px] text-slate-400 font-black italic uppercase tracking-tighter">Real-Time Neural Trust (v4.0.8)</span>
            </div>
          </div>

          <button
            disabled={!selectedFile || loading}
            onClick={handleUpload}
            className="w-full sm:w-auto px-12 py-5 bg-primary hover:bg-primary/90 disabled:bg-slate-800/50 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-primary/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group/btn animate-shimmer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite] pointer-events-none" />
            {loading ? (
               <>
                 <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                 <span>Synchronizing Systems...</span>
               </>
            ) : (
               <>
                 <Zap size={14} className="text-white animate-pulse" />
                 <span>Initialize Neural Stream</span>
               </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-8 p-6 bg-danger/5 border border-danger/20 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4">
            <div className="p-3 bg-danger/10 rounded-xl">
              <ShieldAlert className="text-danger w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-danger font-black uppercase tracking-[0.3em] mb-1">Protocol Violation Detect</p>
              <span className="text-xs text-danger/80 font-bold italic tracking-tight">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
