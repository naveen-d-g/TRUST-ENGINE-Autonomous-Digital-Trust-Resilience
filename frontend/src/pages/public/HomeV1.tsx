import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Zap, 
  Cpu, 
  Lock 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSystemStore } from '@/store/domain/systemStore';

const HomeV1: React.FC = () => {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const isAnalyst = user?.role === 'ANALYST' || user?.role === 'ADMIN';
    const systemStatus = useSystemStore(state => state.status);

    const getStatusDisplay = () => {
        if (systemStatus === 'healthy') return { text: 'SYSTEM ONLINE', color: 'text-emerald-400', dot: 'bg-emerald-500', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]' };
        if (systemStatus === 'degraded') return { text: 'SYSTEM DEGRADED', color: 'text-amber-400', dot: 'bg-amber-500', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.4)]' };
        return { text: 'SYSTEM CRITICAL', color: 'text-red-400', dot: 'bg-red-500', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]' };
    };

    const display = getStatusDisplay();

    return (
        <div className="relative min-h-full flex flex-col items-center justify-start pt-12 bg-[#05080D]">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-5xl px-6 text-center z-10"
            >
                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-10 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">Intelligence Engine Active</span>
                </div>

                <h1 className="text-6xl md:text-[84px] font-black tracking-tighter leading-[0.9] mb-10 text-white drop-shadow-2xl">
                    Autonomous Digital Trust <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-200 to-indigo-400">
                        & Resilience Platform
                    </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-3xl mx-auto mb-14 leading-relaxed opacity-90">
                    Leveraging distributed machine learning to orchestrate real-time <br className="hidden md:block" />
                    security decisions and verify behavioral integrity.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-24">
                    <button
                        onClick={() => navigate(isAnalyst ? '/dashboard' : '/demo')}
                        className="group relative px-10 py-5 bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.45)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="relative flex items-center gap-3">
                            Launch Analyst Dashboard
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    </button>

                    <button
                        onClick={() => navigate('/system-health')}
                        className="px-10 py-5 bg-[#1A1F2E]/60 font-black uppercase tracking-[0.2em] text-xs rounded-xl border border-gray-800/60 backdrop-blur-md transition-all duration-300 hover:bg-[#1A1F2E]/80 hover:border-gray-700 active:scale-95 flex items-center gap-3"
                    >
                        <div className={`w-2 h-2 rounded-full ${display.dot} animate-pulse ${display.glow}`}></div>
                        <span className={display.color}>{display.text}</span>
                    </button>
                </div>
            </motion.div>

            {/* Resilience Cards Grid */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-6 mb-16"
            >
                {[
                    { title: "Security Intelligence", desc: "Neural context processing for predictive anomaly detection.", icon: Cpu, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/20" },
                    { title: "Threat Detection", desc: "Real-time vector analysis identifying sub-second escalations.", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20" },
                    { title: "System Resilience", desc: "Self-healing trust architecture with autonomous rollbacks.", icon: Lock, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20" }
                ].map((card, idx) => (
                    <div 
                        key={idx}
                        className={`p-8 rounded-2xl border ${card.border} ${card.bg} backdrop-blur-xl relative group hover:bg-white/5 transition-all duration-500`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-2xl" />
                        <card.icon className={`w-8 h-8 ${card.color} mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`} />
                        <h3 className="text-lg font-black uppercase tracking-widest text-white mb-3">{card.title}</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">
                            {card.desc}
                        </p>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default HomeV1;