import React from 'react';
import { MotionCard } from '../../../motion/MotionCard';
import { Eye, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tokens } from '../../../design/tokens';
import { Transitions } from '../../../design/motion';

interface OperatorFocusProps {
    focus: {
        headline: string;
        bullets: string[];
    } | null;
}

export const OperatorFocusPanel: React.FC<OperatorFocusProps> = ({ focus }) => {
    if (!focus) return null;

    return (
        <MotionCard className="border-l-4 border-l-primary bg-primary/5 mb-6 relative overflow-hidden">
            <motion.div 
                className="absolute top-0 right-0 p-2 opacity-10"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
            >
                <Eye className="w-24 h-24" />
            </motion.div>

            <div className="flex items-start gap-4 relative z-10">
                <div className="p-2 bg-primary/20 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                    <h3 className="text-[10px] font-mono font-black text-primary mb-1 uppercase tracking-[0.2em]">
                        Command Focus
                    </h3>
                    <div className="text-lg font-bold text-foreground mb-3 leading-tight tracking-tight">
                        {focus.headline}
                    </div>
                    <ul className="space-y-2">
                        <AnimatePresence mode="popLayout">
                            {focus.bullets.map((bullet, idx) => (
                                <motion.li 
                                    key={bullet}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ ...Transitions.smooth, delay: idx * 0.1 }}
                                    className="flex items-start gap-3 text-sm text-foreground/80 leading-relaxed group"
                                >
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                    {bullet}
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                </div>
            </div>
        </MotionCard>
    );
};

