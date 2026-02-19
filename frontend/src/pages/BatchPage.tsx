
import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  X,
  Database,
  Info
} from 'lucide-react';
import { trustService } from '../services/api';
import { useAppContext } from '../context/AppContext';

interface BatchResult {
  total_records: number;
  processed_records: number;
  summary_stats: {
    average_trust_score: number;
    decision_distribution: Record<string, number>;
  };
  results: {
    session_id: string;
    user_id: string;
    ip_address: string;
    trust_score: number;
    final_decision: string;
    primary_cause?: string;
    recommended_action?: string;
  }[];
}

const BatchPage: React.FC = () => {
  const {
    batchFile, setBatchFile,
    isBatchLoading, setIsBatchLoading,
    batchResult, setBatchResult,
    batchError, setBatchError
  } = useAppContext();

  const file = batchFile as File | null;
  const loading = isBatchLoading as boolean;
  const result = batchResult as BatchResult | null;
  const error = batchError as string | null;

  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const validateFile = (selectedFile: File) => {
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
      setBatchFile(selectedFile);
      setBatchError(null);
      return true;
    } else {
      setBatchError('Invalid format. Please upload a CSV intelligence report.');
      setBatchFile(null);
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        validateFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsBatchLoading(true);
      setBatchError(null);
      setSelectedCategory(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await trustService.batch(formData);
      setBatchResult(res);
    } catch (err: any) {
      setBatchError(err?.response?.data?.error || 'Intelligence engine failed to process the request.');
    } finally {
        setIsBatchLoading(false);
    }
  };

  const clear = () => {
    setBatchFile(null);
    setBatchResult(null);
    setBatchError(null);
    setSelectedCategory(null);
  };

  const filteredResults = result?.results?.filter(r => 
    !selectedCategory || r.final_decision === selectedCategory
  ) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-black text-white tracking-tighter">Large-Scale Trust Audit</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium">Upload bulk session data (CSV) for automatic decision processing.</p>
        </div>
      </div>

      {!result && !loading ? (
        <div className="bg-card/50 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-8 lg:p-12 shadow-2xl space-y-8 max-w-4xl mx-auto">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 rounded-3xl p-12 group relative overflow-hidden ${
              isDragging 
                ? 'border-primary bg-primary/5 scale-[1.01] ring-4 ring-primary/10' 
                : 'border-slate-700 bg-slate-800/10 hover:border-slate-500 hover:bg-slate-800/20'
            }`}
          >
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            
            <div className={`absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent transition-opacity duration-300 ${isDragging ? 'opacity-100' : 'opacity-0'}`} />

            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 relative z-20 ${
              isDragging ? 'bg-primary text-white rotate-12 scale-110' : 'bg-slate-800 text-slate-400 group-hover:text-primary group-hover:bg-slate-700'
            }`}>
              {file ? <FileText className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
            </div>

            <div className="text-center relative z-20">
              <h4 className="text-2xl font-black text-white mb-2 tracking-tight transition-all">
                {file ? file.name : 'Drop Master Dataset'}
              </h4>
              <p className="text-slate-500 text-sm font-semibold max-w-xs mx-auto leading-relaxed">
                {file 
                  ? `${(file.size / 1024).toFixed(1)} KB - Ready for ingestion` 
                  : 'Drag and drop or click to browse CSV intelligence reports from your local machine.'
                }
              </p>
            </div>

            {file && (
              <button 
                onClick={(e) => { e.stopPropagation(); clear(); }}
                className="absolute top-4 right-4 z-20 p-2 bg-slate-800 hover:bg-danger/20 text-slate-500 hover:text-danger rounded-xl border border-slate-700 transition-all hover:scale-110"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-start gap-4 text-slate-400 bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
            <div className="mt-0.5 p-1.5 bg-primary/10 rounded-lg">
              <Info className="w-4 h-4 text-primary" />
            </div>
            <p className="text-[11px] font-bold leading-5 italic uppercase tracking-wider opacity-80">
              Note: Batch processing orchestrates the full inference pipeline (Bot, Attack, and Anomaly engines) for every record in the dataset.
            </p>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full py-5 bg-primary hover:bg-primary/80 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95"
          >
            <Database className="w-5 h-5" />
            Initialize Batch Audit
          </button>
          
          {error && (
            <div className="flex items-center gap-3 bg-danger/10 p-4 rounded-xl border border-danger/20 text-danger text-xs font-black uppercase tracking-widest text-center">
              <X className="w-4 h-4 shrink-0" />
              <span className="flex-1">{error}</span>
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="bg-card/50 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-16 shadow-2xl flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <Database className="w-10 h-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-white tracking-tighter">Orchestrating Analytical Core</h3>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em] animate-pulse">Processing {file?.name}...</p>
          </div>
          <div className="w-full max-w-md bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-1/2 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase italic">This process continues in the background if you navigate away.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-card border border-slate-700/30 rounded-3xl p-10 shadow-2xl space-y-10 fade-in relative">
            <button onClick={clear} className="absolute top-8 right-8 p-2 bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-white transition-all rounded-xl border border-slate-700">
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-6">
              <div className="p-6 bg-success/10 rounded-[2.5rem] border border-success/20 shadow-lg shadow-success/10">
                <CheckCircle2 className="w-14 h-14 text-success" />
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-black text-white tracking-tighter leading-none italic">Audit Completed</h3>
                <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">Analysis finished for {file?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Records', val: result?.total_records, color: 'text-white' },
                { label: 'Ingested', val: result?.processed_records, color: 'text-success' },
                { label: 'Avg Integrity', val: `${result?.summary_stats?.average_trust_score?.toFixed(1)}%`, color: 'text-primary' }
              ].map((stat, i) => (
                <div key={i} className="p-8 bg-slate-800/40 border border-slate-700/30 rounded-3xl space-y-1 group hover:border-slate-500 transition-colors">
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">{stat.label}</span>
                  <p className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.val}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/50 rounded-[2.5rem] p-8 lg:p-10 border border-slate-800/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
              
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-8 flex items-center gap-3 relative z-10">
                <FileText className="w-4 h-4 text-primary" /> Click a category for full session details
              </h4>
              
              <div className="flex flex-wrap gap-6 relative z-10">
                {Object.entries(result?.summary_stats?.decision_distribution || {}).map(([key, val]) => (
                  <button 
                    key={key} 
                    onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                    className={`flex-1 min-w-[140px] p-6 rounded-2xl border transition-all duration-300 group ${
                      selectedCategory === key 
                      ? 'bg-slate-700/50 border-primary shadow-lg ring-1 ring-primary/20 scale-[1.02]' 
                      : 'bg-slate-800/80 border-slate-700/50 hover:border-slate-500 shadow-xl'
                    }`}
                  >
                    <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${
                      key === 'ALLOW' ? 'text-success' : key === 'RESTRICT' ? 'text-danger' : 'text-warning'
                    }`}>
                      {key}
                    </span>
                    <div className="flex items-end justify-between mt-3">
                      <span className="text-3xl font-black text-white tracking-tighter">{val as any}</span>
                      <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1 group-hover:text-slate-400 transition-colors">View Data</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Filtered Details Table */}
            {selectedCategory && (
              <div className="space-y-6 fade-in">
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                  <div className="flex items-center gap-3">
                    <Database className={`w-5 h-5 ${
                      selectedCategory === 'ALLOW' ? 'text-success' : selectedCategory === 'RESTRICT' ? 'text-danger' : 'text-warning'
                    }`} />
                    <h4 className="text-xl font-black text-white tracking-tight uppercase italic">{selectedCategory} Intelligence List</h4>
                  </div>
                  <span className="bg-slate-800 px-3 py-1 rounded text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-700">
                    {filteredResults.length} Sessions Found
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Session ID</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">User ID</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">IP Address</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Trust Score</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Primary Risk Vector</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Rec. Strategy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {filteredResults.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors group text-white/90">
                          <td className="px-6 py-4">
                            <code className="text-[10px] text-slate-400 font-medium group-hover:text-primary transition-colors">{row.session_id}</code>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-mono font-bold text-slate-300">{row.user_id || 'UNKNOWN'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-mono text-slate-400 italic">{row.ip_address || '0.0.0.0'}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-sm font-black ${
                              row.trust_score > 70 ? 'text-success' : row.trust_score > 40 ? 'text-warning' : 'text-danger'
                            }`}>
                              {row.trust_score.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-white uppercase italic">{row.primary_cause || 'Minimal Anomaly'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{row.recommended_action}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <button 
                onClick={clear}
                className="px-12 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-slate-700 shadow-xl hover:scale-105 active:scale-95"
              >
                Initialize New Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchPage;
