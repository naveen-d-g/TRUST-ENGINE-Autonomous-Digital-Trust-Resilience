
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/card';
import { pulseVariants } from '../../design/motion';
import { severityTheme } from '../../design/severity';

interface MetricCardProps {
  title: string;
  value: string | number;
  pulse?: boolean;
  severity?: number; // 0-100 logic for coloring
}

const getSeverityColor = (score: number) => {
  if (score >= 80) return severityTheme.CRITICAL.color;
  if (score >= 50) return severityTheme.HIGH.color;
  if (score >= 20) return severityTheme.MEDIUM.color;
  return severityTheme.LOW.color;
};

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, pulse = false, severity }) => {
  const color = severity !== undefined ? getSeverityColor(severity) : undefined;
  
  return (
    <Card className="p-6 relative overflow-hidden bg-card/50 backdrop-blur border-border">
      <div className="relative z-10">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">{title}</h4>
        
        <motion.div 
          className="text-4xl font-bold font-mono"
          animate={pulse ? "pulse" : "stop"}
          variants={pulseVariants}
          style={{ color: color || 'var(--foreground)' }}
        >
          {value}
        </motion.div>
      </div>

      {pulse && (
        <motion.div
            className="absolute inset-0 z-0 bg-red-500/10"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
    </Card>
  );
};
