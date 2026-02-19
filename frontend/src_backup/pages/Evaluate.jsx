
import React, { useState } from 'react';
import { 
  Send, 
  RotateCcw, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { trustService } from '../services/api';

const Evaluate = () => {
  const initialFeatures = {
    session_id: `live_${Date.now()}`,
    user_id: 'analyst_simulate',
    features: {
      request_rate_per_min: 10,
      avg_request_interval: 1.5,
      navigation_entropy: 0.5,
      failed_login_attempts: 0,
      headless_browser_flag: false,
      captcha_passed: true,
      session_duration_sec: 300,
      pages_accessed: 5,
      api_calls_count: 12,
      concurrent_login_count: 1
    }
  };

  const [formData, setFormData] = useState(initialFeatures);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTechnicalWhy, setShowTechnicalWhy] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  const handleInputChange = (field, value) => {
    // Ensure value is not empty - fallback to '0' or appropriate default for numeric
    const safeValue = value === '' ? 0 : value;
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [field]: safeValue }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setFeedbackGiven(null);
      setShowTechnicalWhy(false);
      
      // Filter out any N/A strings if we used them, convert to 0 for model
      const processedFeatures = {};
      Object.entries(formData.features).forEach(([k, v]) => {
        processedFeatures[k] = v === 'N/A' || v === '' ? 0 : v;
      });

      const res = await trustService.evaluate({ ...formData, features: processedFeatures });
      setResult(res);
      setLoading(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Inference engine failed');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ...initialFeatures,
      session_id: `live_${Date.now()}`
    });
    setResult(null);
    setError(null);
    setFeedbackGiven(null);
  };

  const getDecisionStyles = (decision) => {
    switch(decision) {
      case 'ALLOW': return { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', shadow: 'shadow-success/20' };
      case 'RESTRICT': return { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', shadow: 'shadow-warning/20' };
      case 'ESCALATE': 
      case 'DENY': return { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', shadow: 'shadow-danger/20' };
      default: return { color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight italic">Simulation <span className="text-primary tracking-normal not-italic ml-1">Lab Console</span></h2>
          <p className="text-slate-400 text-sm">Simulate behavioral vectors for the decision engine.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-slate-700/30 rounded-2xl p-6 space-y-6 shadow-xl relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                Request Rate <HelpCircle className="w-3 h-3 cursor-help text-slate-600" />
              </label>
              <input 
                type="number" 
                step="0.1"
                placeholder="N/A"
                value={formData.features.request_rate_per_min}
                onChange={(e) => handleInputChange('request_rate_per_min', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Navigation Entropy</label>
              <input 
                type="range" 
                min="0" max="1" step="0.01"
                value={formData.features.navigation_entropy}
                onChange={(e) => handleInputChange('navigation_entropy', parseFloat(e.target.value))}
                className="w-full accent-primary mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase">
                <span>Deterministic</span>
                <span>{(formData.features.navigation_entropy * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Failed Logins</label>
              <input 
                type="number" 
                placeholder="N/A"
                value={formData.features.failed_login_attempts}
                onChange={(e) => handleInputChange('failed_login_attempts', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration (s)</label>
              <input 
                type="number" 
                placeholder="N/A"
                value={formData.features.session_duration_sec}
                onChange={(e) => handleInputChange('session_duration_sec', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pages</label>
              <input 
                type="number" 
                placeholder="N/A"
                value={formData.features.pages_accessed}
                onChange={(e) => handleInputChange('pages_accessed', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">API Calls</label>
              <input 
                type="number" 
                placeholder="N/A"
                value={formData.features.api_calls_count}
                onChange={(e) => handleInputChange('api_calls_count', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Concurrent</label>
              <input 
                type="number" 
                placeholder="N/A"
                value={formData.features.concurrent_login_count}
                onChange={(e) => handleInputChange('concurrent_login_count', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={formData.features.headless_browser_flag}
                  onChange={(e) => handleInputChange('headless_browser_flag', e.target.checked)}
                  className="w-5 h-5 rounded-lg border-slate-700 bg-slate-900 text-primary focus:ring-offset-slate-900 focus:ring-primary appearance-none checked:bg-primary transition-all cursor-pointer border"
                />
                {formData.features.headless_browser_flag && <ShieldAlert className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none" />}
              </div>
              <span className="text-xs font-black text-slate-500 group-hover:text-white transition-colors uppercase tracking-widest">Headless Agent</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={formData.features.captcha_passed}
                  onChange={(e) => handleInputChange('captcha_passed', e.target.checked)}
                  className="w-5 h-5 rounded-lg border-slate-700 bg-slate-900 text-primary focus:ring-offset-slate-900 focus:ring-primary appearance-none checked:bg-success transition-all cursor-pointer border"
                />
                {formData.features.captcha_passed && <ShieldCheck className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none" />}
              </div>
              <span className="text-xs font-black text-slate-500 group-hover:text-white transition-colors uppercase tracking-widest">Verified Human</span>
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/80 disabled:bg-primary/50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
            >
              {loading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />}
              Analyze Behavior
            </button>
            <button 
              type="button"
              onClick={resetForm}
              className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl border border-slate-700/50 transition-all hover:text-white"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Intelligence Output</h2>
          <p className="text-slate-400 text-sm">Real-time decision state and recommended actions.</p>
        </div>

        {loading ? (
          <div className="bg-card border border-slate-700/30 rounded-2xl p-8 shadow-2xl space-y-8 animate-pulse">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-slate-800 rounded-2xl" />
               <div className="space-y-2">
                 <div className="h-2 w-20 bg-slate-800 rounded" />
                 <div className="h-8 w-48 bg-slate-800 rounded" />
               </div>
            </div>
            <div className="h-24 bg-slate-800/50 rounded-2xl" />
            <div className="h-10 bg-slate-800 rounded-xl" />
          </div>
        ) : result ? (
          <div className="bg-card border border-slate-700/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden fade-in space-y-8">
            {/* Decision Hero */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-6 rounded-3xl ${getDecisionStyles(result.final_decision).bg} ${getDecisionStyles(result.final_decision).color} border ${getDecisionStyles(result.final_decision).border} shadow-2xl`}>
                {result.final_decision === 'ALLOW' ? <ShieldCheck className="w-16 h-16" /> : <ShieldAlert className="w-16 h-16" />}
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-black text-slate-500 tracking-[0.3em]">Final Decision</span>
                <h3 className={`text-5xl font-black italic tracking-tighter ${getDecisionStyles(result.final_decision).color}`}>
                  {result.final_decision}
                </h3>
              </div>
              <div className="px-6 py-2 bg-slate-800/80 rounded-full border border-slate-700/50">
                <p className="text-sm font-bold text-white leading-tight">
                  <span className="text-slate-500 mr-2">CAUSE:</span> {result.primary_cause}
                </p>
              </div>
            </div>

            {/* Recommendation & Trust Band */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col justify-center`}>
                <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Recommended Action</span>
                <p className="text-sm font-bold text-primary">{result.recommended_action || 'Monitor Only'}</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30 flex flex-col justify-center items-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Confidence</span>
                <div className="flex items-center gap-2">
                   <Zap className="w-3 h-3 text-accent" />
                   <span className="text-xl font-black text-white">{result.trust_score.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Progressive Disclosure: Technical Why */}
            <div className="space-y-3">
              <button 
                onClick={() => setShowTechnicalWhy(!showTechnicalWhy)}
                className="w-full flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all font-bold text-xs"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  TECHNICAL EVIDENCE
                </div>
                {showTechnicalWhy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showTechnicalWhy && (
                <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-700/50 space-y-4 fade-in">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-600 tracking-widest pl-1">Inference Context</span>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      The decision was synthesized by the Resilience Intelligence Engine based on behavioral markers including navigation entropy ({formData.features.navigation_entropy}), request rate ({formData.features.request_rate_per_min}/min), and session isolation tags.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                       <span className="block text-[8px] text-slate-500 font-bold uppercase mb-1">Risk Bias</span>
                       <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                         <div className="h-full bg-danger" style={{ width: '35%' }} />
                       </div>
                    </div>
                    <div className="flex-1 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                       <span className="block text-[8px] text-slate-500 font-bold uppercase mb-1">Model Drift</span>
                       <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                         <div className="h-full bg-success" style={{ width: '12%' }} />
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analyst Feedback Loop */}
            <div className="pt-4 border-t border-slate-700/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verify Intelligence</span>
                <div className="flex items-center gap-3">
                  {feedbackGiven ? (
                    <div className="flex items-center gap-2 text-primary font-bold text-xs bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 animate-in zoom-in-95">
                      {feedbackGiven === 'confirm' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                      Feedback Logged
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => setFeedbackGiven('false_positive')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-danger/20 hover:text-danger hover:border-danger/30 text-slate-400 rounded-lg border border-slate-700/50 text-xs font-bold transition-all"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" /> False Positive
                      </button>
                      <button 
                        onClick={() => setFeedbackGiven('confirm')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg border border-primary/30 text-xs font-bold transition-all"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> Confirm Incident
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/20 border-2 border-dashed border-slate-700/30 rounded-2xl h-[420px] flex flex-col items-center justify-center p-12 text-center group">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700 group-hover:scale-110 transition-transform duration-300">
              <AlertCircle className="w-6 h-6 text-slate-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-500">Engine Standby</h4>
            <p className="text-slate-600 text-sm mt-2">Simulate behavioral signals to generate real-time trust intelligence.</p>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-danger/10 text-danger border border-danger/20 rounded-xl text-sm font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            Execution Failed: {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Evaluate;
