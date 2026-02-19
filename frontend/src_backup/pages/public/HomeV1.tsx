import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, Activity } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { UserRole } from '../../types/auth';

export const HomeV1: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAnalyst = user?.role === UserRole.ANALYST || user?.role === UserRole.ADMIN;

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl"
            >
                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Intelligence Engine Active</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                    Autonomous Digital Trust <br />
                    <span className="text-primary">& Resilience Platform</span>
                </h1>

                <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
                    Leveraging distributed machine learning to orchestrate real-time 
                    security decisions and verify behavioral integrity.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button
                        onClick={() => navigate(isAnalyst ? '/soc' : '/demo')}
                        className="group relative px-8 py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative flex items-center gap-2">
                            Launch Analyst Dashboard
                            <ChevronRight className="w-4 h-4" />
                        </span>
                    </button>

                    <button
                        onClick={() => navigate('/soc/status')}
                        className="px-8 py-4 bg-muted text-muted-foreground font-black uppercase tracking-widest text-xs rounded-lg border border-border transition-all hover:bg-muted/80 hover:text-foreground active:scale-95"
                    >
                        System Status
                    </button>
                </div>
            </motion.div>

            {/* Quick Stats / Features */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="absolute bottom-12 left-0 right-0 px-6 flex justify-center gap-12 text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
            >
                <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-success" />
                    Core Online
                </div>
                <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-primary" />
                    Policy Enforced
                </div>
            </motion.div>
        </div>
    );
};
