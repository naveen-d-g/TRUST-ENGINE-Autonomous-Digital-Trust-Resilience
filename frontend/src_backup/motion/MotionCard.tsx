import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface MotionCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export const MotionCard: React.FC<MotionCardProps> = ({ children, className, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay, ease: "easeOut" }}
            className={twMerge(clsx("bg-card border border-border rounded-lg p-4 shadow-sm", className))}
        >
            {children}
        </motion.div>
    );
};
