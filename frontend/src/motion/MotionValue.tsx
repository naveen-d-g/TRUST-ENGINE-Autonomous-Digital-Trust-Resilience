import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Tokens } from '../design/tokens';
import { Transitions } from '../design/motion';

interface MotionValueProps {
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
    prefix?: string;
    suffix?: string;
}

export const MotionValue: React.FC<MotionValueProps> = ({ value, className, prefix, suffix }) => {
    const [prevValue, setPrevValue] = useState(value);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (value !== prevValue) {
            setIsUpdating(true);
            const timeout = setTimeout(() => setIsUpdating(false), 1000);
            setPrevValue(value);
            return () => clearTimeout(timeout);
        }
    }, [value, prevValue]);

    const getTrendColor = () => {
        if (!isUpdating) return 'inherit';
        if (typeof value === 'number' && typeof prevValue === 'number') {
            return value > prevValue ? Tokens.colors.severity.critical : Tokens.colors.severity.low;
        }
        return Tokens.colors.primary;
    };

    return (
        <span className={clsx("inline-flex items-center font-mono", className)}>
             {prefix}
             <motion.span
                key={String(value)}
                initial={{ opacity: 0.2, y: 5, filter: 'blur(4px)' }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  filter: 'blur(0px)',
                  color: getTrendColor()
                }}
                transition={Transitions.snappy}
             >
                {value}
             </motion.span>
             {suffix}
        </span>
    );
};
