import React, { useState, useRef } from 'react';
import { Upload, Database, ShieldAlert, CheckCircle2 } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto w-full space-y-8">
      <div 
        className={`relative group rounded-[3rem] p-12 transition-all duration-500 border-2 border-dashed flex flex-col items-center justify-center space-y-6 overflow-hidden ${
          dragActive 
          ? 'bg-primary/10 border-primary shadow-[0_0_50px_rgba(59,130,246,0.2)]' 
          : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50 pointer-events-none" />
        
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleChange}
        />

        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-2xl ${
          selectedFile ? 'bg-success text-white scale-110' : 'bg-slate-800 text-slate-500 group-hover:text-primary group-hover:scale-105 group-hover:bg-slate-700'
        }`}>
          {selectedFile ? <CheckCircle2 size={40} /> : <Upload size={40} />}
        </div>

        <div className="text-center space-y-2 relative z-10">
          <h3 className="text-3xl font-black text-white tracking-tighter italic">
            {selectedFile ? selectedFile.name : 'Ingest Intelligence Master'}
          </h3>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">
            {selectedFile 
              ? `${(selectedFile.size / 1024).toFixed(1)} KB - VALIDATED` 
              : 'Drag & drop or Click to Browse CSV Dataset'}
          </p>
        </div>

        <div className="flex gap-4 relative z-10">
          {!selectedFile ? (
            <button 
              onClick={onButtonClick}
              className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-slate-700 transition-all font-black text-xs uppercase tracking-widest"
            >
              Select CSV File
            </button>
          ) : (
            <button 
              onClick={() => setSelectedFile(null)}
              className="px-8 py-4 bg-danger/10 hover:bg-danger/20 text-danger rounded-2xl border border-danger/30 transition-all font-black text-xs uppercase tracking-widest"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full" />
        
        <div className="flex items-start gap-6">
          <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="text-lg font-black text-white italic uppercase tracking-tight">Audit Requirements</h4>
              <p className="text-slate-500 text-sm">Target file must adhere to the high-fidelity event schema.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {['session_id', 'user_id', 'event_type', 'ip', 'timestamp', 'payload'].map(col => (
                <div key={col} className="bg-slate-800/50 px-4 py-2 rounded-xl text-[10px] font-mono text-slate-400 border border-slate-700/50 flex items-center justify-between">
                  <span>{col}</span>
                  <div className="w-1 h-1 rounded-full bg-primary" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Processing Mode</span>
            <span className="text-xs text-slate-400 font-bold italic">Neural Trust Inference (v4)</span>
          </div>

          <button
            disabled={!selectedFile || loading}
            onClick={handleUpload}
            className="px-12 py-5 bg-primary hover:bg-primary/80 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-primary/50 hover:scale-105 active:scale-95 flex items-center gap-3 relative overflow-hidden"
          >
            {loading ? 'Initializing Engine...' : 'Initialize New Stream'}
          </button>
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3">
            <ShieldAlert className="text-danger w-5 h-5 shrink-0" />
            <span className="text-danger text-[10px] font-black uppercase tracking-widest">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
