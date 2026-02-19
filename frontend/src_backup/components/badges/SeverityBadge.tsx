import React from 'react';
import clsx from 'clsx';
import { Severity } from '../../types/soc';

interface SeverityBadgeProps {
  severity: Severity | string;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className }) => {
  const styles = {
    [Severity.LOW]: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    [Severity.MEDIUM]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    [Severity.HIGH]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    [Severity.CRITICAL]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  };

  // Fallback for unknown strings
  const severityKey = severity as Severity;
  const badgeStyle = styles[severityKey] || 'bg-gray-100 text-gray-800';

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      badgeStyle,
      className
    )}>
      {severity}
    </span>
  );
};
