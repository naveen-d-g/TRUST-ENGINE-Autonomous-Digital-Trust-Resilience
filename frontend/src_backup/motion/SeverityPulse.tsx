import React from 'react';
import { motion } from 'framer-motion';
import { EscalationMatrix, SeverityLevel } from '../design/severity';

interface SeverityPulseProps {
    severity: SeverityLevel | string;
    children: React.ReactNode;
    className?: string;
}

export const SeverityPulse: React.FC<SeverityPulseProps> = ({ severity, children, className }) => {
    const config = EscalationMatrix[severity as SeverityLevel] || EscalationMatrix[SeverityLevel.LOW];

    return (
        <motion.div
            className={className}
            animate={{
                boxShadow: [
                    '0 0 0px transparent',
                    config.glow,
                    '0 0 0px transparent'
                ],
                borderColor: config.color
            }}
            transition={{
                duration: config.pulseSpeed,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            style={{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: '8px'
            }}
        >
            {children}
        </motion.div>
    );
};
